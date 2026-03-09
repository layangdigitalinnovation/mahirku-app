import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { graphologyApi } from '../../api/graphology';
import { LinearGradient } from 'expo-linear-gradient';

export default function GraphologyProcessingScreen() {
    const theme = useTheme();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { testId } = route.params || {};

    const [dots, setDots] = useState('');

    useEffect(() => {
        // Animation for dots
        const int = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);
        return () => clearInterval(int);
    }, []);

    useEffect(() => {
        if (!testId) {
            navigation.goBack();
            return;
        }

        const pollResult = async () => {
            try {
                const result = await graphologyApi.getResult(testId);
                if (result.status === 'completed') {
                    navigation.replace('GraphologyResult', { testId, result });
                } else if (result.status === 'failed') {
                    alert('Gagal menganalisis gambar. Pastikan gambar jelas.');
                    navigation.goBack();
                }
            } catch (error) {
                console.error('Polling error', error);
            }
        };

        const intervalId = setInterval(pollResult, 3000);
        return () => clearInterval(intervalId);
    }, [testId, navigation]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <LinearGradient
                colors={['#EEF2FF', '#F1F5F9', '#F8FAFC']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <View style={styles.glowCircle} />
                    <MaterialCommunityIcons name="brain" size={100} color="#4F46E5" style={styles.pulse} />
                    <View style={styles.magnifyContainer}>
                        <MaterialCommunityIcons name="text-search" size={40} color="#EC4899" />
                    </View>
                </View>

                <Text variant="headlineSmall" style={styles.title}>
                    Sedang Menganalisis{dots}
                </Text>
                <Text variant="bodyMedium" style={styles.subtitle}>
                    AI sedang mengekstrak tulisan dan tanda tangan Anda untuk dianalisis profil kepribadiannya.
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    iconContainer: {
        position: 'relative',
        marginBottom: 48,
        justifyContent: 'center',
        alignItems: 'center',
        height: 160,
        width: 160,
    },
    glowCircle: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2,
        borderColor: 'rgba(99, 102, 241, 0.2)',
    },
    pulse: {
        opacity: 0.9,
    },
    magnifyContainer: {
        position: 'absolute',
        bottom: 10,
        right: 15,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 6,
        shadowColor: '#EC4899',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    title: {
        fontWeight: '800',
        marginBottom: 12,
        color: '#1E293B',
        textAlign: 'center',
        minWidth: 250, // To stabilize dots layout jumping
    },
    subtitle: {
        textAlign: 'center',
        color: '#64748B',
        paddingHorizontal: 30,
        lineHeight: 24,
    },
});
