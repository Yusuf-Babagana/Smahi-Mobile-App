import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { OPENAI_API_KEY } from '@/src/constants/config';

let recording: Audio.Recording | null = null;

const TAG = '[SpeechRecognition]';

export const isSpeechAvailable = true;

export async function requestSpeechPermissions(): Promise<boolean> {
  console.log(TAG, 'requestSpeechPermissions called');
  try {
    const perm = await Audio.requestPermissionsAsync();
    console.log(TAG, 'Permission result:', JSON.stringify(perm));
    return perm.granted;
  } catch (err) {
    console.error(TAG, 'Permission request threw:', err);
    return false;
  }
}

export async function startSpeechRecognition(options?: { lang?: string }) {
  console.log(TAG, 'startSpeechRecognition called', options);
  try {
    console.log(TAG, 'Setting audio mode...');
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
    console.log(TAG, 'Audio mode set successfully');

    console.log(TAG, 'Creating recording with HIGH_QUALITY preset...');
    const result = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    recording = result.recording;
    console.log(TAG, 'Recording created successfully, URI so far:', recording.getURI());
  } catch (err: any) {
    console.error(TAG, 'Failed to start recording:', err?.message || err);
    console.error(TAG, 'Full error:', JSON.stringify(err));
    throw err;
  }
}

export async function stopSpeechRecognition(): Promise<string | null> {
  console.log(TAG, 'stopSpeechRecognition called, recording is:', recording ? 'present' : 'null');
  if (!recording) {
    console.log(TAG, 'No recording to stop, returning empty string');
    return '';
  }

  try {
    console.log(TAG, 'Stopping and unloading recording...');
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log(TAG, 'Recording stopped, URI:', uri);
    recording = null;

    console.log(TAG, 'Resetting audio mode...');
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    console.log(TAG, 'Audio mode reset');

    if (!uri) {
      console.log(TAG, 'URI is null/empty after stop');
      return '';
    }

    if (!OPENAI_API_KEY) {
      console.log(TAG, 'OPENAI_API_KEY is empty or not set');
      return null;
    }

    console.log(TAG, 'Proceeding to transcribeAudio');
    return transcribeAudio(uri);
  } catch (err: any) {
    console.error(TAG, 'Failed to stop recording:', err?.message || err);
    console.error(TAG, 'Full error:', JSON.stringify(err));
    recording = null;
    return '';
  }
}

export function abortSpeechRecognition() {
  console.log(TAG, 'abortSpeechRecognition called');
  if (recording) {
    console.log(TAG, 'Aborting active recording');
    recording.stopAndUnloadAsync().catch(() => {});
    recording = null;
  }
}

export function isCurrentlyRecording() {
  return recording !== null;
}

async function transcribeAudio(uri: string): Promise<string | null> {
  console.log(TAG, 'transcribeAudio called with URI:', uri);
  try {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'recording.m4a';
    const ext = filename.split('.').pop() || 'm4a';
    const mimeType = `audio/${ext === 'm4a' ? 'mp4' : ext}`;

    console.log(TAG, 'File details:', { filename, ext, mimeType, platform: Platform.OS });

    formData.append('file', {
      uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
      name: filename,
      type: mimeType,
    } as any);
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    console.log(TAG, 'Sending request to OpenAI Whisper API...');
    const startTime = Date.now();

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    const elapsed = Date.now() - startTime;
    console.log(TAG, `Response received after ${elapsed}ms, status:`, response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(TAG, 'OpenAI Whisper error:', response.status, errorBody);
      return null;
    }

    const data = await response.json();
    console.log(TAG, 'Transcription result:', JSON.stringify(data));
    return (data.text || '').trim() || null;
  } catch (err: any) {
    console.error(TAG, 'Transcription failed:', err?.message || err);
    console.error(TAG, 'Full error:', JSON.stringify(err));
    return null;
  }
}
