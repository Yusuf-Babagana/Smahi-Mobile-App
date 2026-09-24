import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, Pressable, ActivityIndicator, Modal, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

import { portfolioAPI } from '@/src/api/client';
import { CLOUDINARY_CLOUD_NAME as CLOUD_NAME } from '@/src/constants/env';
import { color, font, radius, space } from '@/constants/theme';
import { Button, EmptyState, useToast, useConfirm } from '@/src/components/ui';

const MAX_ITEMS = 12;

function getImageUrl(image: any): string | null {
  if (!image) return null;
  let url = typeof image === 'string' ? image : image.url;
  if (!url) return null;
  if (!url.startsWith('http') && url.includes('image/upload')) {
    return `https://res.cloudinary.com/${CLOUD_NAME}/${url}`;
  }
  if (url.startsWith('http:')) return url.replace('http:', 'https:');
  return url;
}

// One shared "showcase" screen for the two roles that have something to
// show clients — artisans and businesses (core.models.PortfolioItem on the
// backend covers both). This is the business entry point; see
// app/business/dashboard.tsx's "Photo showcase" card for how it's reached.
export default function BusinessShowcaseScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { show: showToast } = useToast();
  const confirm = useConfirm();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [pickedAsset, setPickedAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [kind, setKind] = useState<'service' | 'for_sale'>('service');
  const [priceLabel, setPriceLabel] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await portfolioAPI.getMine();
      setItems(data || []);
    } catch (error) {
      console.log('Portfolio load error:', error);
      showToast(t('Could not load your photos.'), { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const closeSheet = () => {
    setPickedAsset(null);
    setKind('service');
    setPriceLabel('');
    setCaption('');
  };

  const pickImage = async () => {
    if (items.length >= MAX_ITEMS) {
      showToast(t('You can have up to {{max}} photos — remove one first.', { max: MAX_ITEMS }), { type: 'warn' });
      return;
    }
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      showToast(t('Allow access to photos to add one.'), { type: 'warn' });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!result.canceled) {
      setPickedAsset(result.assets[0]);
    }
  };

  const submitUpload = async () => {
    if (!pickedAsset) return;
    setUploading(true);
    try {
      const created = await portfolioAPI.add(
        { uri: pickedAsset.uri, type: pickedAsset.mimeType },
        { kind, caption: caption.trim(), price_label: kind === 'for_sale' ? priceLabel.trim() : '' }
      );
      setItems(prev => [created, ...prev]);
      showToast(t('Photo added.'), { type: 'success' });
      closeSheet();
    } catch (error: any) {
      const msg = error.response?.data?.error || t('Could not upload this photo. Please try again.');
      showToast(msg, { type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: any) => {
    const ok = await confirm({
      title: t('Remove this photo?'),
      message: t('Clients will no longer see it.'),
      confirmLabel: t('Remove'),
      destructive: true,
    });
    if (!ok) return;

    setDeletingId(item.id);
    try {
      await portfolioAPI.remove(item.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch (error) {
      showToast(t('Could not remove this photo.'), { type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const url = getImageUrl(item.image);
    return (
      <View style={styles.cell}>
        {url ? (
          <Image source={{ uri: url }} style={styles.cellImage} resizeMode="cover" />
        ) : (
          <View style={[styles.cellImage, styles.cellImageFallback]}>
            <MaterialIcons name="image" size={26} color={color.ink300} />
          </View>
        )}
        <Pressable
          onPress={() => handleDelete(item)}
          disabled={deletingId === item.id}
          accessibilityRole="button"
          accessibilityLabel={t('Remove photo')}
          style={styles.removeBtn}
        >
          {deletingId === item.id ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <MaterialIcons name="close" size={13} color="#FFF" />
          )}
        </Pressable>
        {(item.caption || item.price_label) ? (
          <View style={styles.cellCaptionWrap}>
            {item.caption ? (
              <Text style={styles.cellCaption} numberOfLines={1}>{item.caption}</Text>
            ) : null}
            {item.kind === 'for_sale' && item.price_label ? (
              <Text style={styles.cellPrice} numberOfLines={1}>{item.price_label}</Text>
            ) : null}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel={t('Back')}>
            <MaterialIcons name="arrow-back" size={20} color={color.ink900} />
          </Pressable>
          <Text style={styles.headerTitle}>{t('Photo showcase')}</Text>
          <Pressable onPress={pickImage} style={styles.addButton} accessibilityRole="button" accessibilityLabel={t('Add photo')}>
            <MaterialIcons name="add" size={20} color="#FFF" />
          </Pressable>
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={color.brand600} />
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          icon="photo-library"
          title={t('No photos yet')}
          message={t('Show clients your work or what you sell — add a few of your best photos to get started.')}
          actionLabel={t('Add your first photo')}
          onAction={pickImage}
          style={{ marginTop: space.xxxl }}
        />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{ gap: space.md }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={pickedAsset !== null}
        transparent
        animationType="fade"
        onRequestClose={closeSheet}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalTop}>
              <Text style={styles.modalTitle}>{t('Add a photo')}</Text>
              <Pressable onPress={closeSheet} accessibilityRole="button" accessibilityLabel={t('Close')} style={styles.modalCloseBtn}>
                <MaterialIcons name="close" size={16} color={color.ink900} />
              </Pressable>
            </View>

            {pickedAsset ? (
              <Image source={{ uri: pickedAsset.uri }} style={styles.previewImage} resizeMode="cover" />
            ) : null}

            <Text style={styles.fieldLabel}>{t('What is this photo?')}</Text>
            <View style={styles.kindRow}>
              <Pressable
                onPress={() => setKind('service')}
                style={[styles.kindChip, kind === 'service' && styles.kindChipActive]}
                accessibilityRole="button"
              >
                <Text style={[styles.kindChipText, kind === 'service' && styles.kindChipTextActive]}>{t('A service')}</Text>
              </Pressable>
              <Pressable
                onPress={() => setKind('for_sale')}
                style={[styles.kindChip, kind === 'for_sale' && styles.kindChipActive]}
                accessibilityRole="button"
              >
                <Text style={[styles.kindChipText, kind === 'for_sale' && styles.kindChipTextActive]}>{t('Item for sale')}</Text>
              </Pressable>
            </View>

            {kind === 'for_sale' ? (
              <>
                <Text style={styles.fieldLabel}>{t('Price')}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={t('e.g. ₦18,000')}
                  placeholderTextColor={color.ink300}
                  value={priceLabel}
                  onChangeText={setPriceLabel}
                />
              </>
            ) : null}

            <Text style={styles.fieldLabel}>{t('Caption (optional)')}</Text>
            <TextInput
              style={styles.textInput}
              placeholder={t('e.g. Brake pads (set)')}
              placeholderTextColor={color.ink300}
              value={caption}
              onChangeText={setCaption}
            />

            <View style={styles.modalActions}>
              <Button title={t('Cancel')} variant="secondary" onPress={closeSheet} disabled={uploading} style={{ flex: 1 }} />
              <Button title={t('Upload')} onPress={submitUpload} loading={uploading} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.surfaceSunken },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  headerSafe: { backgroundColor: color.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    backgroundColor: color.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: { fontFamily: font.extrabold, fontSize: 16, color: color.ink900 },
  backButton: {
    width: 40, height: 40, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: color.border,
    alignItems: 'center', justifyContent: 'center',
  },
  addButton: {
    width: 40, height: 40, borderRadius: radius.md,
    backgroundColor: color.brand600,
    alignItems: 'center', justifyContent: 'center',
  },

  grid: { padding: space.xl, paddingBottom: 60 },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: color.surface,
    marginBottom: space.md,
  },
  cellImage: { width: '100%', height: '100%' },
  cellImageFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: color.brand100 },
  removeBtn: {
    position: 'absolute', top: 6, right: 6,
    width: 24, height: 24, borderRadius: 8,
    backgroundColor: 'rgba(11,31,63,0.6)',
    alignItems: 'center', justifyContent: 'center',
  },
  cellCaptionWrap: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 8, paddingTop: 20, paddingBottom: 8,
    backgroundColor: 'rgba(11,31,63,0.55)',
  },
  cellCaption: { fontFamily: font.extrabold, fontSize: 11.5, color: '#FFF' },
  cellPrice: { fontFamily: font.bold, fontSize: 10.5, color: '#FDE68A', marginTop: 1 },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: color.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: space.xl,
    paddingBottom: space.xxl,
  },
  modalTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md },
  modalTitle: { fontFamily: font.extrabold, fontSize: 16, color: color.ink900 },
  modalCloseBtn: {
    width: 32, height: 32, borderRadius: radius.md,
    backgroundColor: color.surfaceSunken,
    alignItems: 'center', justifyContent: 'center',
  },
  previewImage: { width: '100%', height: 160, borderRadius: radius.lg, marginBottom: space.lg, backgroundColor: color.surfaceSunken },
  fieldLabel: { fontFamily: font.extrabold, fontSize: 12, color: color.ink900, marginBottom: space.sm },
  kindRow: { flexDirection: 'row', gap: space.sm, marginBottom: space.lg },
  kindChip: {
    flex: 1, paddingVertical: 11, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: color.border, backgroundColor: color.surface,
    alignItems: 'center',
  },
  kindChipActive: { backgroundColor: color.brand600, borderColor: color.brand600 },
  kindChipText: { fontFamily: font.extrabold, fontSize: 12.5, color: color.ink600 },
  kindChipTextActive: { color: '#FFF' },
  textInput: {
    height: 46, borderWidth: 1.5, borderColor: color.border, borderRadius: radius.md,
    paddingHorizontal: space.md, fontFamily: font.semibold, fontSize: 14, color: color.ink900,
    marginBottom: space.lg,
  },
  modalActions: { flexDirection: 'row', gap: space.md, marginTop: space.xs },
});
