import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

export type TestPrepChip = { label: string; value: string; tone: 'primary' | 'success' | 'warning' | 'neutral' };

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  theme: { a: string; b: string };
  chips: TestPrepChip[];
  aboutTitle: string;
  aboutBody: string;
  instructions: string[];
  startLabel: string;
  onStart: () => void;
  startDisabled?: boolean;
};

const toneColors = (tone: TestPrepChip['tone']) => {
  if (tone === 'success') return { bg: '#DCFCE7', fg: '#166534', border: '#BBF7D0', dot: '#22C55E' };
  if (tone === 'warning') return { bg: '#FEF3C7', fg: '#92400E', border: '#FDE68A', dot: '#F59E0B' };
  if (tone === 'primary') return { bg: '#EEF2FF', fg: '#3730A3', border: '#E0E7FF', dot: '#6366F1' };
  return { bg: '#F1F5F9', fg: '#334155', border: '#E2E8F0', dot: '#64748B' };
};

export default function TestPrepSheet({
  visible,
  onClose,
  title,
  subtitle,
  theme,
  chips,
  aboutTitle,
  aboutBody,
  instructions,
  startLabel,
  onStart,
  startDisabled,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(18, insets.bottom + 12) }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          <View style={styles.chipRow}>
            {chips.map((c, idx) => {
              const t = toneColors(c.tone);
              return (
                <View key={`${idx}-${c.label}`} style={[styles.chip, { backgroundColor: t.bg, borderColor: t.border }]}>
                  <View style={[styles.dot, { backgroundColor: t.dot }]} />
                  <Text style={[styles.chipText, { color: t.fg }]}>{c.value}</Text>
                  <Text style={[styles.chipTextMuted, { color: t.fg }]}>{c.label}</Text>
                </View>
              );
            })}
          </View>

          <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ paddingBottom: 8 }} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{aboutTitle}</Text>
              <View style={styles.card}>
                <Text style={styles.body}>{aboutBody}</Text>
              </View>
            </View>

            <View style={[styles.section, { marginTop: 16 }]}>
              <Text style={styles.sectionTitle}>Petunjuk</Text>
              <View style={styles.card}>
                <View style={{ gap: 12 }}>
                  {instructions.map((it, i) => (
                    <View key={`${i}-${it}`} style={styles.row}>
                      <View style={styles.num}>
                        <Text style={styles.numText}>{i + 1}</Text>
                      </View>
                      <Text style={styles.body}>{it}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          <Pressable
            onPress={onStart}
            disabled={startDisabled}
            style={({ pressed }) => [
              styles.startWrap,
              pressed && !startDisabled && { transform: [{ scale: 0.995 }], opacity: 0.96 },
              startDisabled && { opacity: 0.65 },
            ]}
          >
            <LinearGradient colors={[theme.a, theme.b]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startBtn}>
              <Feather name="play" size={18} color="#FFFFFF" />
              <Text style={styles.startText}>{startLabel}</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  handle: { width: 44, height: 5, borderRadius: 999, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 12 },
  header: { alignItems: 'center', paddingHorizontal: 6, marginBottom: 14 },
  title: { fontSize: 18, fontWeight: '900', color: '#0F172A', textAlign: 'center' },
  subtitle: { marginTop: 6, fontSize: 13, fontWeight: '600', color: '#64748B', textAlign: 'center', lineHeight: 18 },

  chipRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, borderWidth: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { fontSize: 13, fontWeight: '900' },
  chipTextMuted: { fontSize: 13, fontWeight: '800', opacity: 0.85 },

  section: { paddingHorizontal: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: '#0F172A', marginBottom: 10, marginTop: 6 },
  card: { borderRadius: 18, padding: 14, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  body: { color: '#334155', fontSize: 13, lineHeight: 20, fontWeight: '600', flex: 1 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  num: { width: 24, height: 24, borderRadius: 8, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  numText: { fontSize: 12, fontWeight: '900', color: '#334155' },

  startWrap: { marginTop: 14, borderRadius: 18, overflow: 'hidden' },
  startBtn: { height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 },
  startText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 0.3 },
});

