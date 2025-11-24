import React from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import ReactNativeBiometrics from 'react-native-biometrics';
import { api } from '../api/client';

export default function TestStartScreen() {
  const startTest = async () => {
    const { data } = await api.post('/biometrics/challenge/auth');
    const rnBiometrics = new ReactNativeBiometrics();
    const { success, signature } = await rnBiometrics.createSignature({ promptMessage: 'Konfirmasi Fingerprint', payload: data.challenge });
    if (!success) return;
    await api.post('/biometrics/verify/auth', { challengeId: data.challengeId, signature });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text variant="titleLarge">Mulai Tes Cognitive Style</Text>
      <Button mode="contained" onPress={startTest} style={{ marginTop: 16 }}>Mulai</Button>
    </View>
  );
}
