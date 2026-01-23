import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

type Props = { onGooglePress?: () => void };

export default function SocialAuthRow({ onGooglePress }: Props) {
  return (
    <View style={styles.row}>
      <Pressable style={[styles.btn, styles.btnOutline]} android_ripple={{ color: '#EAF4FF' }} onPress={onGooglePress}>
        <AntDesign name="google" size={18} color="#DB4437" />
        <Text style={styles.btnText}>Google</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, marginTop: 12 },
  btn: { flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  btnOutline: { borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
  btnText: { color: '#0F172A', fontWeight: '600' },
});
