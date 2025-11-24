import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = { children?: React.ReactNode };

export default function GradientBackground({ children }: Props) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#FFFFFF", "#F8FBFF", "#F1F5F9"]}
        locations={[0, 0.6, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { flex: 1 },
});
