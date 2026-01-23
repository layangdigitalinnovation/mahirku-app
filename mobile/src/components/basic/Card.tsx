import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, ImageSourcePropType, Platform } from 'react-native';

type Props = {
  title?: string;
  subtitle?: string;
  imageSource?: ImageSourcePropType;
  onPress?: () => void;
  children?: React.ReactNode;
  style?: any;
  variant?: 'solid' | 'glass';
};

export default function Card({ title, subtitle, imageSource, onPress, children, style, variant = 'solid' }: Props) {
  const base = variant === 'glass' ? styles.cardGlass : styles.card;
  const Content = (
    <View style={[base, style]}>
      {imageSource ? <Image source={imageSource} style={styles.image} resizeMode="cover" /> : null}
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
  if (onPress) {
    return (
      <Pressable android_ripple={{ color: '#EAF4FF' }} onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.98 }]}> 
        {Content}
      </Pressable>
    );
  }
  return Content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 6 },
    }),
  },
  cardGlass: {
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.35)',
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(227,238,249,0.4)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 2 },
    }),
  },
  image: { width: '100%', height: 160, borderRadius: 12 },
  title: { color: '#0F172A', fontSize: 16, fontWeight: '700' },
  subtitle: { color: '#5A6B85', fontSize: 13 },
});
