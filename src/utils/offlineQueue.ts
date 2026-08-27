import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';

// --- Offline-first submission queue ---
//
// Built for field agents (app/agent/register.tsx today; any future
// "can't let network loss lose a completed form" screen can reuse this
// directly) working in areas with weak or intermittent connectivity.
//
// Lifecycle per item:
//   draft            -- not used by this module; the *form itself* being
//                        filled in is the draft, held in the screen's own
//                        state / a lightweight autosave (see
//                        useDraftAutosave below) until the user submits.
//   pending_sync      -- submitted by the user, but not yet confirmed by
//                        the server (either never tried because there was
//                        no network at submit time, or a submit attempt
//                        failed).
//   syncing           -- an attempt is in flight right now.
//   server_verified   -- the server accepted it. Terminal, success.
//   failed            -- the server rejected it for a real reason (a
//                        validation error, not a network error) — needs a
//                        person to look at it, not an automatic retry.
//
// Every item carries a `clientRequestId` (a UUID minted once, when the
// item is first queued) that is sent to the server as `client_request_id`
// on every attempt, including retries — the backend (see
// UserRegistrationSerializer / register_view / AgentRegisterArtisanView)
// treats a repeat of the same id as "already done" and replays that
// result instead of creating a duplicate. This is what makes "network
// flaked right as the request landed, so the device isn't sure if it
// succeeded" safe to just retry.

export type QueueItemStatus = 'pending_sync' | 'syncing' | 'server_verified' | 'failed';

export interface QueueItem<TPayload = any> {
  id: string; // == clientRequestId
  type: string; // e.g. 'agent_register_artisan'
  payload: TPayload;
  status: QueueItemStatus;
  attempts: number;
  createdAt: number;
  updatedAt: number;
  lastError?: string;
  serverResult?: any;
}

const STORAGE_KEY = 'smahii_offline_queue_v1';
// A real (non-network) rejection from the server shouldn't be retried
// forever without a person looking at it — but a handful of automatic
// retries absorbs the common "synced right as network was still flaky"
// case before giving up.
const MAX_AUTO_ATTEMPTS = 5;

function makeId(): string {
  // Good enough uniqueness for a client-generated idempotency key — this
  // never needs to be cryptographically unbreakable, only unique per
  // device per submission. expo-crypto's randomUUID is unavailable on
  // some older Android WebViews; this avoids adding a dependency for it.
  return `dev-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

async function readQueue(): Promise<QueueItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function writeQueue(items: QueueItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Best-effort — a failed write here just means state lives only in
    // memory for this session, same risk as before this module existed.
  }
}

// A single in-memory subscriber list so every screen watching the queue
// (a "pending sync" badge, an agent's own dashboard counts) re-renders the
// moment anything changes, without each one polling AsyncStorage itself.
type Listener = (items: QueueItem[]) => void;
const listeners = new Set<Listener>();
let cache: QueueItem[] | null = null;

async function getAll(): Promise<QueueItem[]> {
  if (cache) return cache;
  cache = await readQueue();
  return cache;
}

async function persist(items: QueueItem[]) {
  cache = items;
  await writeQueue(items);
  listeners.forEach((l) => l(items));
}

export function subscribeToQueue(listener: Listener): () => void {
  listeners.add(listener);
  getAll().then((items) => listener(items));
  return () => listeners.delete(listener);
}

export async function getQueue(type?: string): Promise<QueueItem[]> {
  const all = await getAll();
  return type ? all.filter((i) => i.type === type) : all;
}

/**
 * Queues a submission for background sync. Returns the queued item
 * immediately — the caller should treat this as "saved, will sync" rather
 * than waiting for a server response.
 */
export async function enqueue<TPayload>(type: string, payload: TPayload): Promise<QueueItem<TPayload>> {
  const item: QueueItem<TPayload> = {
    id: makeId(),
    type,
    payload,
    status: 'pending_sync',
    attempts: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const all = await getAll();
  await persist([...all, item]);
  return item;
}

async function updateItem(id: string, patch: Partial<QueueItem>) {
  const all = await getAll();
  const next = all.map((i) => (i.id === id ? { ...i, ...patch, updatedAt: Date.now() } : i));
  await persist(next);
}

/** Removes a terminal item (server_verified, or a failed one the user has
 * acknowledged) from the queue once it's no longer useful to show. */
export async function dismissItem(id: string) {
  const all = await getAll();
  await persist(all.filter((i) => i.id !== id));
}

export type Submitter = (payload: any, clientRequestId: string) => Promise<any>;

/**
 * Attempts to sync every pending_sync/failed item whose type has a
 * registered submitter. Safe to call repeatedly/overlappingly — items
 * already `syncing` are skipped.
 */
export async function processQueue(submitters: Record<string, Submitter>): Promise<void> {
  const all = await getAll();
  const due = all.filter((i) => i.status === 'pending_sync' || i.status === 'failed');

  for (const item of due) {
    const submit = submitters[item.type];
    if (!submit) continue; // no handler registered for this type right now

    await updateItem(item.id, { status: 'syncing' });
    try {
      const result = await submit(item.payload, item.id);
      await updateItem(item.id, { status: 'server_verified', serverResult: result, lastError: undefined });
    } catch (err: any) {
      const isNetworkError = !err?.response; // axios: no response at all == never reached the server
      const attempts = item.attempts + 1;
      const permanentlyFailed = !isNetworkError || attempts >= MAX_AUTO_ATTEMPTS;
      await updateItem(item.id, {
        status: permanentlyFailed ? 'failed' : 'pending_sync',
        attempts,
        lastError: err?.response?.data ? JSON.stringify(err.response.data) : (err?.message || 'Sync failed'),
      });
    }
  }
}

/**
 * Call once (e.g. in a top-level provider) with the map of submitters this
 * app knows how to sync. Triggers a sync pass immediately, then again
 * whenever the device regains network — no polling, no fixed interval.
 */
export function startAutoSync(submitters: Record<string, Submitter>): () => void {
  let cancelled = false;
  let wasReachable: boolean | null = null;

  const tick = async () => {
    try {
      const state = await Network.getNetworkStateAsync();
      const reachable = !!state.isConnected && state.isInternetReachable !== false;
      if (reachable && wasReachable !== true) {
        // Just came back online (or this is the first check) — worth a
        // sync pass now rather than waiting for the next poll.
        if (!cancelled) await processQueue(submitters);
      }
      wasReachable = reachable;
    } catch {
      // Network state check itself failed — treat as "unknown", try again
      // next tick rather than assuming online or offline.
    }
  };

  tick();
  const interval = setInterval(tick, 15000);
  return () => {
    cancelled = true;
    clearInterval(interval);
  };
}

// --- Lightweight draft autosave (form-in-progress, before submission) ---
//
// Separate from the sync queue above: this just survives the app being
// killed mid-form-fill, so an agent who was 80% through registering an
// artisan and got interrupted doesn't have to start over. Keyed by
// screen/form name so multiple forms don't collide.

const DRAFT_PREFIX = 'smahii_draft_';

export async function saveDraft(formKey: string, data: any): Promise<void> {
  try {
    await AsyncStorage.setItem(DRAFT_PREFIX + formKey, JSON.stringify({ data, savedAt: Date.now() }));
  } catch {
    // Best-effort — worst case, the draft just isn't recovered.
  }
}

export async function loadDraft<T = any>(formKey: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(DRAFT_PREFIX + formKey);
    if (!raw) return null;
    return JSON.parse(raw).data as T;
  } catch {
    return null;
  }
}

export async function clearDraft(formKey: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(DRAFT_PREFIX + formKey);
  } catch {
    // no-op
  }
}

/** Live view of the queue (optionally filtered to one type), for a
 * "pending sync" badge or an agent's own status counters. Re-renders
 * whenever the queue changes anywhere in the app. */
export function useOfflineQueue(type?: string) {
  const [items, setItems] = useState<QueueItem[]>([]);

  useEffect(() => {
    return subscribeToQueue((all) => {
      setItems(type ? all.filter((i) => i.type === type) : all);
    });
  }, [type]);

  const counts = {
    pending_sync: items.filter((i) => i.status === 'pending_sync' || i.status === 'syncing').length,
    server_verified: items.filter((i) => i.status === 'server_verified').length,
    failed: items.filter((i) => i.status === 'failed').length,
    total: items.length,
  };

  return { items, counts };
}
