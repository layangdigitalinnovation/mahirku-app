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
  errorText?: string;
  multiline?: boolean;
  containerStyle?: any;
  inputStyle?: any;
  secureToggle?: boolean;
};

export default function TextField({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, errorText, multiline, containerStyle, inputStyle, secureToggle }: Props) {
  const [isSecure, setIsSecure] = useState(Boolean(secureTextEntry));
  const showToggle = Boolean(secureToggle);
  const effectiveSecure = showToggle ? isSecure : Boolean(secureTextEntry);
  const placeholderColor = useMemo(() => (effectiveSecure ? '#7F8EA3' : '#7F8EA3'), [effectiveSecure]);
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputWrapper}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={effectiveSecure}
          keyboardType={keyboardType}
          multiline={multiline}
          placeholderTextColor={placeholderColor}
          style={[styles.input, showToggle && styles.inputWithIcon, inputStyle]}
        />
        {showToggle ? (
          <Pressable style={styles.iconRight} onPress={() => setIsSecure(s => !s)}>
            <Ionicons name={effectiveSecure ? 'eye-off' : 'eye'} size={20} color="#7F8EA3" />
          </Pressable>
        ) : null}
      </View>
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
  iconRight: { position: 'absolute', right: 12, top: 14 },
  error: { color: '#ef4444', marginTop: 6, fontSize: 12 },
});
