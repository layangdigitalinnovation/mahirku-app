import React from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';

export default function TestStartScreen({ navigation }: any) {
  const startTest = () => {
    navigation.navigate('CognitiveDataEntry');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text variant="titleLarge">Mulai Tes Cognitive Style</Text>
      <Button mode="contained" onPress={startTest} style={{ marginTop: 16 }}>Mulai</Button>
    </View>
  );
}
