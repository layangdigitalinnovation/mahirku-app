import { ToastAndroid } from 'react-native';

export function showToast(message: string, duration: 'short' | 'long' = 'short') {
  ToastAndroid.show(message, duration === 'short' ? ToastAndroid.SHORT : ToastAndroid.LONG);
}

