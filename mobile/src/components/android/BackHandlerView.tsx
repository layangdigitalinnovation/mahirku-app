import React, { useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';

type Props = { onBackPress: () => boolean; children: React.ReactNode };

export default function BackHandlerView({ onBackPress, children }: Props) {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [onBackPress]);
  return <>{children}</>;
}

