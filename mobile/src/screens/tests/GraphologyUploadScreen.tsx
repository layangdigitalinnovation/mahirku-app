import React, { useState } from 'react';
import { View, StyleSheet, Image, Alert, Platform, TouchableOpacity, Linking } from 'react-native';
import { Text, Button, Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { graphologyApi } from '../../api/graphology';
import { useQuery } from '@tanstack/react-query';
import { meApi } from '../../api/auth';
import { LinearGradient } from 'expo-linear-gradient';

export default function GraphologyUploadScreen() {
    const theme = useTheme();
    const navigation = useNavigation<any>();
    const [image, setImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    type Me = { user?: { id?: number; fullname?: string; tokens?: number } };
    const { data } = useQuery<Me>({
        queryKey: ['me'],
        queryFn: async () => (await meApi()).data,
    });
    const user = data?.user;

    /** Arahkan user ke pengaturan jika izin ditolak permanen */
    const openAppSettings = () => Linking.openSettings();

    /**
     * GALERI — Gunakan expo-document-picker (bukan expo-image-picker)
     * Keuntungan:
     * - Menggunakan Android Storage Access Framework (SAF)
     * - TIDAK BUTUH permission apa pun (no READ_MEDIA_IMAGES)
     * - Selalu berfungsi reliable di semua versi Android
     * - Google Play compliant
     */
    const pickImage = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
                copyToCacheDirectory: true,  // Pastikan file bisa diakses oleh app
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Document Picker Error:', error);
            Alert.alert('Gagal Memilih Foto', 'Terjadi kesalahan saat membuka galeri. Silakan coba lagi.');
        }
    };

    /**
     * KAMERA — Tetap gunakan expo-image-picker
     * Camera permission straightforward dan tidak pernah bermasalah
     */
    const takePhoto = async () => {
        const current = await ImagePicker.getCameraPermissionsAsync();

        if (!current.granted) {
            if (!current.canAskAgain) {
                Alert.alert(
                    'Akses Kamera Diperlukan',
                    'Izin kamera ditolak secara permanen. Aktifkan di Pengaturan.',
                    [
                        { text: 'Batal', style: 'cancel' },
                        { text: 'Buka Pengaturan', onPress: openAppSettings },
                    ]
                );
                return;
            }
            const asked = await ImagePicker.requestCameraPermissionsAsync();
            if (!asked.granted) {
                Alert.alert(
                    'Akses Ditolak',
                    'Izin kamera diperlukan untuk mengambil foto tulisan Anda.'
                );
                return;
            }
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSelectImageMode = () => {
        Alert.alert(
            'Pilih Sumber Foto',
            'Apakah Anda ingin mengambil foto menggunakan kamera atau memilih dari galeri?',
            [
                { text: 'Kamera', onPress: takePhoto },
                { text: 'Galeri', onPress: pickImage },
                { text: 'Batal', style: 'cancel' }
            ]
        );
    };

    const handleUpload = async () => {
        if (!image) {
            Alert.alert('Gambar Belum Dipilih', 'Silakan pilih atau ambil foto terlebih dahulu.');
            return;
        }

        if (!user || user.id === undefined) {
            Alert.alert('Sesi Berakhir', 'Silakan login kembali.');
            return;
        }

        const tokens = user.tokens ?? 0;
        if (tokens <= 0) {
            Alert.alert(
                'Token Tidak Cukup',
                'Anda memerlukan minimal 1 token untuk melakukan tes. Silakan beli token terlebih dahulu.',
                [
                    { text: 'Batal', style: 'cancel' },
                    { text: 'Beli Token', onPress: () => navigation.navigate('TokenPackages') }
                ]
            );
            return;
        }

        setIsUploading(true);
        try {
            let imageToUpload = image;
            
            // Try to compress image to save bandwidth and prevent Groq payload limit errors.
            // Wrapped in try-catch so it won't crash if the native module isn't linked yet.
            try {
                const manipResult = await ImageManipulator.manipulateAsync(
                    image,
                    [{ resize: { width: 1024 } }],
                    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
                );
                imageToUpload = manipResult.uri;
            } catch (manipError) {
                console.warn('Image manipulation failed, falling back to original image:', manipError);
            }

            const response = await graphologyApi.uploadImage(imageToUpload, user.id);
            if (response.status === 'processing' && response.test_id) {
                navigation.replace('GraphologyProcessing', { testId: response.test_id });
            } else {
                Alert.alert('Upload Gagal', response.message || 'Terjadi kesalahan');
            }
        } catch (error: any) {
            console.error('Upload Error:', error);
            const status = error?.response?.status;
            if (status === 403) {
                Alert.alert(
                    'Token Tidak Cukup',
                    'Token Anda tidak mencukupi untuk melakukan tes.',
                    [
                        { text: 'Batal', style: 'cancel' },
                        { text: 'Beli Token', onPress: () => navigation.navigate('TokenPackages') }
                    ]
                );
                return;
            }
            Alert.alert('Upload Gagal', error?.response?.data?.message || error.message || 'Gagal menyambung ke server');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <LinearGradient
                colors={['#EEF2FF', '#F1F5F9', '#F8FAFC']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <View style={styles.content}>
                <View style={styles.header}>
                    <LinearGradient
                        colors={['#8B5CF6', '#6366F1']}
                        style={styles.iconBackground}
                    >
                        <MaterialCommunityIcons name="cloud-upload-outline" size={36} color="#FFF" />
                    </LinearGradient>
                    <Text variant="headlineSmall" style={styles.title}>Unggah Foto Tulisan</Text>
                    <Text variant="bodyMedium" style={styles.subtitle}>
                        Pilih dari galeri atau ambil foto langsung tulisan tangan beserta tanda tangan Anda.
                    </Text>
                </View>

                <TouchableOpacity onPress={handleSelectImageMode} activeOpacity={0.8} disabled={isUploading}>
                    <Surface style={styles.imagePreviewContainer} elevation={4}>
                        {image ? (
                            <>
                                <Image source={{ uri: image }} style={styles.imagePreview} />
                                <View style={styles.imageOverlay}>
                                    <MaterialCommunityIcons name="check-circle" size={48} color="#10B981" />
                                    <Text style={styles.successText}>Gambar Berhasil Dipilih</Text>
                                    <Text style={styles.reselectText}>Ketuk untuk mengubah foto</Text>
                                </View>
                            </>
                        ) : (
                            <View style={styles.placeholder}>
                                <View style={styles.dashedBox}>
                                    <MaterialCommunityIcons name="image-plus" size={48} color="#94A3B8" />
                                    <Text style={styles.placeholderText}>Belum ada foto yang dipilih</Text>
                                    <Text style={styles.placeholderSubtext}>Format: JPG, PNG (Max. 5MB)</Text>
                                </View>
                            </View>
                        )}
                    </Surface>
                </TouchableOpacity>

                <View style={styles.actionRow}>
                    <Button
                        mode="contained-tonal"
                        icon={() => <Feather name="camera" size={20} color="#6366F1" />}
                        onPress={takePhoto}
                        style={styles.pickerButton}
                        labelStyle={{ color: '#6366F1', fontWeight: 'bold' }}
                        disabled={isUploading}
                    >
                        Buka Kamera
                    </Button>
                    <Button
                        mode="contained-tonal"
                        icon={() => <Feather name="image" size={20} color="#4F46E5" />}
                        onPress={pickImage}
                        style={styles.pickerButton}
                        labelStyle={{ color: '#4F46E5', fontWeight: 'bold' }}
                        disabled={isUploading}
                    >
                        Pilih File
                    </Button>
                </View>
            </View>

            <Surface style={styles.footer} elevation={5}>
                <Button
                    mode="contained"
                    onPress={handleUpload}
                    style={[styles.submitButton, (!image || isUploading) && { backgroundColor: '#CBD5E1' }]}
                    labelStyle={styles.submitButtonText}
                    disabled={!image || isUploading}
                    loading={isUploading}
                    buttonColor="#4F46E5"
                >
                    {isUploading ? 'Sedang Diproses...' : 'Kirim untuk Analisis'}
                </Button>
            </Surface>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: {
        flex: 1,
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 10,
    },
    iconBackground: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    title: {
        fontWeight: '800',
        marginBottom: 8,
        color: '#1E293B',
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
        color: '#64748B',
        paddingHorizontal: 10,
        lineHeight: 22,
    },
    imagePreviewContainer: {
        width: '100%',
        aspectRatio: 3 / 4,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        marginBottom: 24,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    successText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        marginTop: 12,
        fontSize: 16,
    },
    reselectText: {
        color: '#E2E8F0',
        fontSize: 14,
        marginTop: 8,
    },
    placeholder: {
        flex: 1,
        padding: 16,
    },
    dashedBox: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
    },
    placeholderText: {
        color: '#64748B',
        fontWeight: '600',
        fontSize: 16,
        marginTop: 16,
    },
    placeholderSubtext: {
        color: '#94A3B8',
        fontSize: 13,
        marginTop: 8,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 16,
    },
    pickerButton: {
        flex: 1,
        borderRadius: 16,
        paddingVertical: 6,
        backgroundColor: '#EEF2FF',
    },
    footer: {
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 34 : 24,
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    submitButton: {
        borderRadius: 16,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonText: {
        paddingVertical: 8,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});
