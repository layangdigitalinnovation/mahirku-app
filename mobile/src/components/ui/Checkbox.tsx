import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';

type Props = { checked: boolean; onChange: (v: boolean) => void; label?: string };

export default function Checkbox({ checked, onChange, label }: Props) {
  return (
    <Pressable style={styles.row} onPress={() => onChange(!checked)} android_ripple={{ color: '#EAF4FF' }}>
      <View style={[styles.box, checked && styles.boxChecked]} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  box: { width: 20, height: 20, borderRadius: 6, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#FFFFFF' },
  boxChecked: { backgroundColor: '#EEFF55', borderColor: '#E7F34F' },
  label: { color: '#0F172A' },
});

