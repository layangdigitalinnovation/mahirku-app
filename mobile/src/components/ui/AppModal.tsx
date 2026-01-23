import React from 'react';
import { Modal, View, StyleSheet, Pressable } from 'react-native';

type Props = { visible: boolean; onRequestClose: () => void; children: React.ReactNode };

export default function AppModal({ visible, onRequestClose, children }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onRequestClose} />
        <View style={styles.container}>{children}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  container: { width: '100%', borderRadius: 16, backgroundColor: '#FFFFFF', padding: 16 },
});

