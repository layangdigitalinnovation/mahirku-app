import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

type Props = { onGoogle?: () => void; onApple?: () => void };

export default function SocialAuthRow({ onGoogle, onApple }: Props) {
  return (
    <View>
      <View style={styles.separator} />
      <Text style={styles.orText}>Or continue with</Text>
      <View style={styles.row}>
        <Pressable style={styles.social} android_ripple={{ color: '#EAF4FF' }} onPress={onGoogle}>
          <AntDesign name="google" size={16} color="#0F172A" />
          <Text style={styles.socialText}>Google</Text>
        </Pressable>
        <Pressable style={styles.social} android_ripple={{ color: '#EAF4FF' }} onPress={onApple}>
          <AntDesign name="apple" size={16} color="#0F172A" />
          <Text style={styles.socialText}>Apple</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  separator: { height: 1, backgroundColor: '#E2E8F0', marginTop: 20 },
  orText: { textAlign: 'center', color: '#5A6B85', marginTop: 12 },
  row: { flexDirection: 'row', gap: 12, marginTop: 12 },
  social: { flex: 1, height: 44, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  socialText: { color: '#0F172A', fontWeight: '600' },
});
