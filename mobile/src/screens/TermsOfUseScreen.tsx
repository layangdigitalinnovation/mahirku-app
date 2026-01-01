import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import Card from '../components/basic/Card';

export default function TermsOfUseScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();

    const sections = [
        {
            title: '1. Penerimaan Syarat',
            content: 'Dengan mengakses dan menggunakan platform Mahirku, Anda menyetujui untuk terikat oleh syarat dan ketentuan penggunaan ini. Jika Anda tidak setuju dengan salah satu ketentuan ini, harap tidak menggunakan layanan kami.'
        },
        {
            title: '2. Penggunaan Layanan',
            content: 'Mahirku menyediakan platform untuk melakukan berbagai tes psikometri termasuk Cognitive Style Test dan DISC Test. Layanan ini ditujukan untuk pengembangan diri dan tidak menggantikan konsultasi profesional.'
        },
        {
            title: '3. Akun Pengguna',
            content: 'Anda bertanggung jawab untuk menjaga kerahasiaan kredensial akun Anda. Setiap aktivitas yang terjadi di bawah akun Anda menjadi tanggung jawab Anda sepenuhnya. Segera laporkan jika terjadi penggunaan tidak sah.'
        },
        {
            title: '4. Privasi Data',
            content: 'Kami berkomitmen untuk melindungi privasi Anda. Data pribadi dan hasil tes Anda disimpan dengan aman dan hanya digunakan sesuai kebijakan privasi kami. Kami tidak akan membagikan informasi pribadi Anda tanpa persetujuan.'
        },
        {
            title: '5. Token dan Pembayaran',
            content: 'Pembelian token bersifat final dan non-refundable kecuali dalam kondisi tertentu yang kami tentukan. Token digunakan untuk mengakses tes dan fitur premium. Harga token dapat berubah sewaktu-waktu.'
        },
        {
            title: '6. Kekayaan Intelektual',
            content: 'Semua konten, termasuk namun tidak terbatas pada teks, grafik, logo, dan perangkat lunak adalah milik Mahirku dan dilindungi oleh hukum kekayaan intelektual yang berlaku.'
        },
        {
            title: '7. Batasan Tanggung Jawab',
            content: 'Mahirku tidak bertanggung jawab atas kerugian langsung maupun tidak langsung yang timbul dari penggunaan layanan. Hasil tes bersifat informatif dan tidak menjamin hasil tertentu dalam kehidupan profesional atau pribadi.'
        },
        {
            title: '8. Perubahan Syarat',
            content: 'Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diberitahukan melalui platform dan email terdaftar. Penggunaan berkelanjutan setelah perubahan dianggap sebagai penerimaan terhadap syarat yang diperbarui.'
        },
        {
            title: '9. Penghentian Layanan',
            content: 'Kami berhak menangguhkan atau menghentikan akses Anda jika terjadi pelanggaran terhadap syarat penggunaan, penyalahgunaan layanan, atau alasan lain yang kami anggap perlu untuk menjaga integritas platform.'
        },
        {
            title: '10. Hukum yang Berlaku',
            content: 'Syarat dan ketentuan ini tunduk pada hukum Republik Indonesia. Setiap sengketa yang timbul akan diselesaikan melalui pengadilan yang berwenang di Indonesia.'
        },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Header */}
            <LinearGradient
                colors={['#4F46E5', '#6366F1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top + 12 }]}
            >
                <View style={styles.headerContent}>
                    <Pressable
                        style={styles.backBtn}
                        android_ripple={{ color: '#E0E7FF' }}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={22} color="#FFF" />
                    </Pressable>
                    <View style={{ flex: 1, alignItems: 'center', marginLeft: -40 }}>
                        <Feather name="shield" size={32} color="#FFF" style={{ marginBottom: 8 }} />
                        <Text style={styles.headerTitle}>Terms of Use</Text>
                        <Text style={styles.headerSubtitle}>Syarat & Ketentuan Penggunaan</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Content */}
            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 24,
                    paddingBottom: insets.bottom + 24
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Introduction Card */}
                <Card style={styles.introCard}>
                    <View style={styles.introIconWrap}>
                        <Feather name="info" size={20} color="#3B82F6" />
                    </View>
                    <Text style={styles.introTitle}>Informasi Penting</Text>
                    <Text style={styles.introText}>
                        Harap baca syarat dan ketentuan berikut dengan seksama sebelum menggunakan layanan Mahirku.
                        Penggunaan platform kami menandakan persetujuan Anda terhadap seluruh ketentuan yang tercantum.
                    </Text>
                </Card>

                {/* Terms Sections */}
                {sections.map((section, index) => (
                    <Card key={index} style={styles.termCard}>
                        <View style={styles.numberBadge}>
                            <Text style={styles.numberText}>{(index + 1).toString().padStart(2, '0')}</Text>
                        </View>
                        <Text style={styles.termTitle}>{section.title}</Text>
                        <Text style={styles.termContent}>{section.content}</Text>
                    </Card>
                ))}

                {/* Footer */}
                <Card style={styles.footerCard}>
                    <Feather name="mail" size={18} color="#64748B" style={{ marginBottom: 8 }} />
                    <Text style={styles.footerTitle}>Butuh Bantuan?</Text>
                    <Text style={styles.footerText}>
                        Jika Anda memiliki pertanyaan mengenai syarat dan ketentuan ini, silakan hubungi kami di:
                    </Text>
                    <Text style={styles.footerContact}>support@mahirku.com</Text>
                </Card>

                {/* Last Updated */}
                <Text style={styles.lastUpdated}>
                    Terakhir diperbarui: 1 Januari 2026
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingBottom: 32,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '800',
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 13,
        fontWeight: '500',
        marginTop: 4,
    },

    introCard: {
        padding: 20,
        marginBottom: 20,
        borderRadius: 20,
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    introIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#DBEAFE',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    introTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 8,
    },
    introText: {
        fontSize: 14,
        lineHeight: 22,
        color: '#475569',
    },

    termCard: {
        padding: 20,
        marginBottom: 16,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    numberBadge: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E0E7FF',
    },
    numberText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#4F46E5',
    },
    termTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 10,
    },
    termContent: {
        fontSize: 14,
        lineHeight: 24,
        color: '#475569',
        textAlign: 'justify',
    },

    footerCard: {
        padding: 20,
        marginTop: 8,
        marginBottom: 16,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        alignItems: 'center',
    },
    footerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 8,
    },
    footerText: {
        fontSize: 13,
        lineHeight: 20,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 12,
    },
    footerContact: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4F46E5',
    },

    lastUpdated: {
        fontSize: 12,
        color: '#94A3B8',
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: 8,
    },
});
