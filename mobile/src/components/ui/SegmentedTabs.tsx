import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';

type Props = { items: string[]; activeIndex: number; onChange: (index: number) => void };

export default function SegmentedTabs({ items, activeIndex, onChange }: Props) {
  return (
    <View style={styles.container}>
      {items.map((label, i) => (
        <Pressable key={label} style={[styles.item, i === activeIndex ? styles.active : styles.inactive]} android_ripple={{ color: '#EAF4FF' }} onPress={() => onChange(i)}>
          <Text style={[styles.text, i === activeIndex ? styles.textActive : styles.textInactive]}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 28, padding: 4 },
  item: { flex: 1, height: 44, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  active: { backgroundColor: '#3B82F6' },
  inactive: { backgroundColor: 'transparent' },
  text: { fontWeight: '700' },
  textActive: { color: '#FFFFFF' },
  textInactive: { color: '#5A6B85' },
});
