import React from 'react';
import { Pressable, Text, View, StyleSheet, ActivityIndicator } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: any;
  textStyle?: any;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export default function PrimaryButton({ title, onPress, disabled, loading, variant = 'primary', style, textStyle, leftIcon, rightIcon }: Props) {
  const colors = {
    primaryBg: '#3BB1FF',
    secondaryBg: '#FFFFFF',
    outlineBorder: '#3BB1FF',
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#0F172A',
  };

  const baseStyle = [styles.base] as any[];
  if (variant === 'outline') baseStyle.push(styles.outline);
  else if (variant === 'secondary') baseStyle.push({ backgroundColor: colors.secondaryBg } as any);
  else baseStyle.push({ backgroundColor: colors.primaryBg } as any);

  const textColor = variant === 'outline' ? colors.textOnPrimary : variant === 'secondary' ? colors.textOnSecondary : colors.textOnPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      android_ripple={{ color: '#89CEFF' }}
      style={({ pressed }) => [baseStyle, pressed && { opacity: 0.9 }, (disabled || loading) && { opacity: 0.6 }, style]}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={textColor} /> : leftIcon}
        <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.text, { color: textColor }, textStyle]}>{title}</Text>
        {rightIcon}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, minWidth: 0 },
  text: { fontSize: 16, fontWeight: '600', flexShrink: 1 },
  outline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#3BB1FF' },
});

