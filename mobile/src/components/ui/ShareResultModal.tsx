import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import AppModal from './AppModal';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  primary: string;
  secondary?: string;
  theme: { a: string; b: string };
  caption: string;
  onSharePoster: () => Promise<void>;
  onShareText: () => Promise<void>;
};

export default function ShareResultModal({
  visible,
  onClose,
  title,
  subtitle,
  primary,
  secondary,
  theme,
  caption,
  onSharePoster,
  onShareText,
}: Props) {
  const [loading, setLoading] = useState<'poster' | 'text' | null>(null);

  const previewSecondary = useMemo(() => {
    const s = (secondary || '').trim();
    return s.length > 0 ? s : undefined;
  }, [secondary]);

  const copyCaption = async () => {
    try {
      await Clipboard.setStringAsync(caption);
      Alert.alert('Tersalin', 'Caption berhasil disalin.');
    } catch {
      Alert.alert('Gagal', 'Tidak dapat menyalin caption.');
    }
  };

  const run = async (kind: 'poster' | 'text', fn: () => Promise<void>) => {
    if (loading) return;
    setLoading(kind);
    try {
      await fn();
    } catch (e: any) {
      Alert.alert('Gagal', e?.message || 'Terjadi kesalahan saat membagikan.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <AppModal visible={visible} onRequestClose={onClose}>
      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <View style={styles.sheetTitleWrap}>
            <View style={styles.sheetIcon}>
              <Feather name="share-2" size={18} color="#4F46E5" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.sheetTitleRow}>
                <View style={{ flex: 1 }}>
                  <AppText weight="800" size={16} color="#0F172A">
                    Bagikan Hasil
                  </AppText>
                  <AppText weight="600" size={13} color="#64748B">
                    Tingkatkan branding Mahirku dengan sekali share
                  </AppText>
                </View>
              </View>
            </View>
          </View>
          <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
            <Feather name="x" size={18} color="#64748B" />
          </Pressable>
        </View>

        <View style={styles.previewWrap}>
          <LinearGradient colors={[theme.a, theme.b]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.preview}>
            <View style={styles.previewTop}>
              <View style={styles.brandPill}>
                <AppText weight="900" size={11} color="#FFFFFF">
                  MAHIRKU
                </AppText>
              </View>
              <View style={styles.testPill}>
                <AppText weight="800" size={11} color="#FFFFFF">
                  {title}
                </AppText>
              </View>
            </View>

            {subtitle ? (
              <AppText weight="700" size={13} color="rgba(255,255,255,0.92)">
                {subtitle}
              </AppText>
            ) : null}

            <View style={{ marginTop: 10 }}>
              <AppText weight="800" size={12} color="rgba(255,255,255,0.85)">
                HASIL UTAMA
              </AppText>
              <AppText weight="900" size={28} color="#FFFFFF">
                {primary}
              </AppText>
              {previewSecondary ? (
                <AppText weight="700" size={13} color="rgba(255,255,255,0.95)">
                  {previewSecondary}
                </AppText>
              ) : null}
            </View>

            <View style={styles.previewFooter}>
              <AppText weight="800" size={12} color="rgba(255,255,255,0.92)">
                mahirku.com
              </AppText>
              <View style={styles.previewHint}>
                <Feather name="camera" size={13} color="rgba(255,255,255,0.92)" />
                <AppText weight="800" size={12} color="rgba(255,255,255,0.92)">
                  Share ke Stories / Status
                </AppText>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => run('poster', onSharePoster)}
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && { transform: [{ scale: 0.99 }], opacity: 0.95 },
              loading && loading !== 'poster' && { opacity: 0.6 },
            ]}
            disabled={Boolean(loading && loading !== 'poster')}
          >
            <LinearGradient colors={['#4F46E5', '#6366F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtnBg}>
              <Feather name="image" size={18} color="#FFFFFF" />
              <AppText weight="900" size={14} color="#FFFFFF">
                {loading === 'poster' ? 'Menyiapkan...' : 'Share Poster (PDF)'}
              </AppText>
            </LinearGradient>
          </Pressable>

          <View style={styles.row}>
            <Pressable
              onPress={() => run('text', onShareText)}
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && { transform: [{ scale: 0.99 }], opacity: 0.96 },
                loading && loading !== 'text' && { opacity: 0.6 },
              ]}
              disabled={Boolean(loading && loading !== 'text')}
            >
              <View style={styles.secondaryBtnInner}>
                <Feather name="send" size={16} color="#4F46E5" />
                <AppText weight="900" size={13} color="#1E293B">
                  {loading === 'text' ? 'Memuat...' : 'Share Caption'}
                </AppText>
              </View>
            </Pressable>

            <Pressable onPress={copyCaption} style={({ pressed }) => [styles.secondaryBtn, pressed && { transform: [{ scale: 0.99 }], opacity: 0.96 }]}>
              <View style={styles.secondaryBtnInner}>
                <Feather name="copy" size={16} color="#4F46E5" />
                <AppText weight="900" size={13} color="#1E293B">
                  Salin Caption
                </AppText>
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </AppModal>
  );
}

function AppText({ children, weight, size, color }: { children: React.ReactNode; weight: '600' | '700' | '800' | '900'; size: number; color: string }) {
  return <Text style={{ fontWeight: weight, fontSize: size, color }}>{children}</Text>;
}

const styles = StyleSheet.create({
  sheet: { gap: 14 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  sheetIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  sheetTitleRow: { flexDirection: 'row', alignItems: 'center' },
  closeBtn: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },

  previewWrap: { borderRadius: 18, overflow: 'hidden' },
  preview: { padding: 16, minHeight: 170, borderRadius: 18 },
  previewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  brandPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  testPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  previewFooter: { marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewHint: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(15,23,42,0.22)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)' },

  actions: { gap: 10 },
  primaryBtn: { borderRadius: 16, overflow: 'hidden' },
  primaryBtnBg: { height: 48, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  row: { flexDirection: 'row', gap: 10 },
  secondaryBtn: { flex: 1, height: 44, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF', overflow: 'hidden' },
  secondaryBtnInner: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
});
