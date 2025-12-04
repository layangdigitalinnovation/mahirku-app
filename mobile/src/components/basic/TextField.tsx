import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  textContentType?: any;
  returnKeyType?: any;
  editable?: boolean;
  onPress?: () => void;
  errorText?: string;
  multiline?: boolean;
  containerStyle?: any;
  inputStyle?: any;
  secureToggle?: boolean;
  startIcon?: React.ReactNode;
};

export default function TextField({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize, textContentType, returnKeyType, editable = true, onPress, errorText, multiline, containerStyle, inputStyle, secureToggle, startIcon }: Props) {
  const [isSecure, setIsSecure] = useState(Boolean(secureTextEntry));
  const showToggle = Boolean(secureToggle);
  const effectiveSecure = showToggle ? isSecure : Boolean(secureTextEntry);
  const placeholderColor = useMemo(() => (effectiveSecure ? '#7F8EA3' : '#7F8EA3'), [effectiveSecure]);
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {onPress ? (
        <Pressable style={styles.inputWrapper} onPress={onPress} android_ripple={{ color: '#EAF4FF' }}>
          {startIcon && (
            <View style={styles.iconLeft}>
              {startIcon}
            </View>
          )}
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            secureTextEntry={effectiveSecure}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            textContentType={textContentType}
            returnKeyType={returnKeyType}
            editable={editable}
            multiline={multiline}
            placeholderTextColor={placeholderColor}
            style={[
              styles.input,
              showToggle && styles.inputWithIcon,
              startIcon && styles.inputWithStartIcon,
              inputStyle
            ]}
          />
          {showToggle ? (
            <Pressable style={styles.iconRight} onPress={() => setIsSecure(s => !s)}>
              <Ionicons name={effectiveSecure ? 'eye-off' : 'eye'} size={20} color="#7F8EA3" />
            </Pressable>
          ) : null}
        </Pressable>
      ) : (
        <View style={styles.inputWrapper}>
          {startIcon && (
            <View style={styles.iconLeft}>
              {startIcon}
            </View>
          )}
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            secureTextEntry={effectiveSecure}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            textContentType={textContentType}
            returnKeyType={returnKeyType}
            editable={editable}
            multiline={multiline}
            placeholderTextColor={placeholderColor}
            style={[
              styles.input,
              showToggle && styles.inputWithIcon,
              startIcon && styles.inputWithStartIcon,
              inputStyle
            ]}
          />
          {showToggle ? (
            <Pressable style={styles.iconRight} onPress={() => setIsSecure(s => !s)}>
              <Ionicons name={effectiveSecure ? 'eye-off' : 'eye'} size={20} color="#7F8EA3" />
            </Pressable>
          ) : null}
        </View>
      )}
      {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  label: { color: '#0F172A', marginBottom: 8, fontSize: 14, fontWeight: '600' },
  inputWrapper: { position: 'relative' },
  input: { height: 52, borderRadius: 16, borderWidth: 1, borderColor: '#E3EEF9', backgroundColor: '#FFFFFF', paddingHorizontal: 14, color: '#0F172A', fontSize: 16 },
  inputWithIcon: { paddingRight: 42 },
  inputWithStartIcon: { paddingLeft: 42 },
  iconRight: { position: 'absolute', right: 12, top: 14 },
  iconLeft: { position: 'absolute', left: 12, top: 14, zIndex: 1 },
  error: { color: '#ef4444', marginTop: 6, fontSize: 12 },
});
