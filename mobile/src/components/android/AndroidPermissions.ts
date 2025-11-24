import { PermissionsAndroid, Permission } from 'react-native';

export async function requestPermission(permission: Permission, title: string, message: string) {
  const result = await PermissionsAndroid.request(permission, { title, message, buttonPositive: 'OK' });
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export async function requestCameraPermission() {
  return requestPermission(PermissionsAndroid.PERMISSIONS.CAMERA, 'Izin Kamera', 'Aplikasi membutuhkan akses kamera untuk melanjutkan');
}

export async function requestLocationPermission() {
  return requestPermission(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    'Izin Lokasi',
    'Aplikasi membutuhkan akses lokasi untuk melanjutkan'
  );
}
