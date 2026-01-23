import { resolvedBaseURL } from './client';
import { loadToken } from '../store/auth';
import * as FileSystem from 'expo-file-system';
import { Linking, Platform } from 'react-native';

export const downloadCertificate = async (testId: number): Promise<void> => {
    const token = await loadToken();
    if (!token) throw new Error('No auth token');

    const url = `${resolvedBaseURL}/api/certificates/thinking-style/${testId}`;
    const fileName = `cognitive-test-certificate-${testId}.pdf`;
    const dir = (((FileSystem as any).documentDirectory) ?? ((FileSystem as any).cacheDirectory) ?? '') as string;
    const fileUri = `${dir}${fileName}`;

    // Download file
    const downloadResult = await FileSystem.downloadAsync(url, fileUri, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/pdf'
        }
    });

    if (downloadResult.status !== 200) {
        throw new Error('Failed to download certificate');
    }

    try {
        if (Platform.OS === 'android') {
            try {
                const perm = await (FileSystem as any).StorageAccessFramework.requestDirectoryPermissionsAsync();
                if (perm?.granted && perm?.directoryUri) {
                const destUri = await (FileSystem as any).StorageAccessFramework.createFileAsync(
                        perm.directoryUri,
                        fileName,
                        'application/pdf'
                    );
                    try {
                        await (FileSystem as any).StorageAccessFramework.copyAsync(fileUri, destUri);
                    } catch {
                        const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: (FileSystem as any).EncodingType.Base64 });
                        await FileSystem.writeAsStringAsync(destUri, base64, { encoding: (FileSystem as any).EncodingType.Base64 });
                    }
                    await Linking.openURL(destUri);
                    return;
                }
            } catch {}

            const contentUri = await FileSystem.getContentUriAsync(fileUri);
            await Linking.openURL(contentUri);
            return;
        }
        await Linking.openURL(fileUri);
    } catch {}
};
