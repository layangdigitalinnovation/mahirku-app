import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

type Props = { fullscreen?: boolean; color?: string; size?: 'small' | 'large' };

export default function Loader({ fullscreen = false, color = '#3BB1FF', size = 'large' }: Props) {
  if (fullscreen) {
    return (
      <View style={styles.overlay}>
        <ActivityIndicator color={color} size={size} />
      </View>
    );
  }
  return <ActivityIndicator color={color} size={size} />;
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.1)' },
});

