import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Surface, useTheme, List } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { meApi } from '../../api/auth';

export default function GraphologyIntroScreen() {
    const theme = useTheme();
    const navigation = useNavigation<any>();
    type Me = { user?: { tokens?: number } };
    const { data } = useQuery<Me>({ queryKey: ['me'], queryFn: async () => (await meApi()).data, retry: false });
    const tokens = data?.user?.tokens ?? 0;

    const startGraphology = () => {
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
        navigation.navigate('GraphologyUpload');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <LinearGradient
                colors={['#EEF2FF', '#F1F5F9', '#F8FAFC']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.headerContainer}>
                    <LinearGradient
                        colors={['#8B5CF6', '#6366F1']}
                        style={styles.iconBackground}
                    >
                        <MaterialCommunityIcons name="draw-pen" size={42} color="#FFFFFF" />
                    </LinearGradient>
                    <Text variant="headlineMedium" style={styles.title}>Graphology Test</Text>
                    <Text variant="bodyLarge" style={styles.subtitle}>
                        Kenali potensi kepribadian Anda melalui analisis cerdas dari tulisan tangan dan tanda tangan.
                    </Text>
                </View>

                <Surface style={styles.instructionCard} elevation={2}>
                    <View style={styles.cardHeader}>
                        <Feather name="info" size={20} color={theme.colors.primary} />
                        <Text variant="titleMedium" style={styles.cardTitle}>Instruksi Penulisan</Text>
                    </View>
                    <List.Item
                        title="Siapkan kertas putih polos tanpa garis."
                        titleNumberOfLines={2}
                        left={props => <View style={styles.listIconBox}><MaterialCommunityIcons name="file-document-outline" size={24} color="#6366F1" /></View>}
                    />
                    <List.Item
                        title="Gunakan bolpoin bertinta hitam atau biru."
                        titleNumberOfLines={2}
                        left={props => <View style={styles.listIconBox}><MaterialCommunityIcons name="pen" size={24} color="#6366F1" /></View>}
                    />
                    <List.Item
                        title="Tuliskan 2-3 kalimat bebas mengenai diri Anda."
                        titleNumberOfLines={2}
                        left={props => <View style={styles.listIconBox}><MaterialCommunityIcons name="card-text-outline" size={24} color="#6366F1" /></View>}
                    />
                    <List.Item
                        title="Tambahkan tanda tangan asli di bagian bawah."
                        titleNumberOfLines={2}
                        left={props => <View style={styles.listIconBox}><MaterialCommunityIcons name="signature-freehand" size={24} color="#6366F1" /></View>}
                    />
                </Surface>

                <Surface style={styles.exampleCard} elevation={0}>
                    <View style={styles.exampleHeader}>
                        <MaterialCommunityIcons name="format-quote-open" size={24} color="#94A3B8" />
                        <Text variant="bodyMedium" style={styles.exampleLabel}>Contoh Format Teks:</Text>
                    </View>
                    <Text variant="bodyLarge" style={styles.exampleText}>
                        Saya adalah pribadi yang selalu ingin{"\n"}
                        belajar dan berkembang dalam hidup.{"\n\n"}
                        <Text style={{ fontWeight: 'bold', color: '#6366F1' }}>[ Tanda Tangan Anda ]</Text>
                    </Text>
                </Surface>
            </ScrollView>

            <Surface style={styles.footer} elevation={5}>
                <Button
                    mode="contained"
                    onPress={startGraphology}
                    style={styles.startButton}
                    contentStyle={styles.startButtonContent}
                    labelStyle={styles.startButtonText}
                    buttonColor="#4F46E5"
                >
                    Mulai Test Sekarang
                </Button>
            </Surface>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    headerContainer: {
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
        lineHeight: 22,
    },
    instructionCard: {
        padding: 20,
        borderRadius: 24,
        marginBottom: 24,
        backgroundColor: '#FFFFFF',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontWeight: 'bold',
        marginLeft: 8,
        color: '#1E293B',
    },
    listIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        marginLeft: 0,
        marginVertical: 4,
    },
    exampleCard: {
        padding: 24,
        borderRadius: 24,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
    },
    exampleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    exampleLabel: {
        fontWeight: 'bold',
        marginLeft: 8,
        color: '#64748B',
    },
    exampleText: {
        fontStyle: 'italic',
        lineHeight: 26,
        color: '#475569',
    },
    footer: {
        padding: 24,
        paddingBottom: 34,
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    startButton: {
        borderRadius: 16,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    startButtonContent: {
        paddingVertical: 8,
    },
    startButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});
