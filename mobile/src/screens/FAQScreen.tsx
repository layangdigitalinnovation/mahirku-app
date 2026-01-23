import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import Card from '../components/basic/Card';

type FAQItem = {
    question: string;
    answer: string;
    category: string;
};

export default function FAQScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const faqs: FAQItem[] = [
        {
            category: 'Umum',
            question: 'Apa itu Mahirku?',
            answer: 'Mahirku adalah platform psikometri digital yang menyediakan berbagai tes untuk membantu Anda memahami gaya berpikir, kepribadian, dan potensi diri. Kami menggunakan metodologi ilmiah dan teknologi sidik jari untuk memberikan hasil yang akurat dan personal.'
        },
        {
            category: 'Umum',
            question: 'Tes apa saja yang tersedia?',
            answer: 'Saat ini Mahirku menyediakan Cognitive Style Test (CST) yang menganalisis gaya berpikir Anda dan DISC Test untuk profil kepribadian. Setiap tes dirancang untuk memberikan insight mendalam tentang karakteristik unik Anda.'
        },
        {
            category: 'Token',
            question: 'Bagaimana cara membeli token?',
            answer: 'Anda dapat membeli token melalui menu Token Packages di aplikasi. Pilih paket yang sesuai, masukkan kode voucher jika ada, lalu lanjutkan ke pembayaran. Kami menerima berbagai metode pembayaran melalui Xendit.'
        },
        {
            category: 'Token',
            question: 'Apakah token bisa dikembalikan?',
            answer: 'Token yang sudah dibeli bersifat non-refundable. Namun, jika terjadi kesalahan teknis atau masalah pembayaran, silakan hubungi tim support kami dan kami akan membantu menyelesaikan masalahnya.'
        },
        {
            category: 'Token',
            question: 'Berapa lama masa berlaku token?',
            answer: 'Token yang Anda beli tidak memiliki masa kadaluarsa. Anda dapat menggunakan token kapan saja untuk melakukan tes tanpa batas waktu.'
        },
        {
            category: 'Test',
            question: 'Bagaimana cara melakukan Cognitive Style Test?',
            answer: 'Pilih Cognitive Style Test dari dashboard, isi data diri (tanggal lahir dan golongan darah), lalu lakukan verifikasi sidik jari. Anda juga dapat mengisi kuesioner tambahan untuk hasil yang lebih akurat. Tes akan menganalisis pola sidik jari dan jawaban Anda.'
        },
        {
            category: 'Test',
            question: 'Mengapa harus menggunakan sidik jari?',
            answer: 'Sidik jari mengandung pola unik yang dapat memberikan insight tentang karakteristik kognitif seseorang. Teknologi kami menganalisis pola ini dengan metode ilmiah untuk memberikan hasil yang lebih personal dan akurat.'
        },
        {
            category: 'Test',
            question: 'Apakah hasil tes akurat?',
            answer: 'Hasil tes kami didasarkan pada metodologi yang telah teruji secara ilmiah. Namun,  hasil tes bersifat informatif dan sebaiknya digunakan sebagai panduan pengembangan diri, bukan satu-satunya penentu dalam pengambilan keputusan penting.'
        },
        {
            category: 'Test',
            question: 'Bisakah saya mengulang tes?',
            answer: 'Ya, Anda dapat mengulang tes kapan saja dengan menggunakan token. Namun untuk hasil yang konsisten, disarankan ada jarak waktu yang cukup antar tes karena hasil tes mencerminkan kondisi Anda saat tes dilakukan.'
        },
        {
            category: 'Akun',
            question: 'Bagaimana cara mengubah profil?',
            answer: 'Buka menu Profile, pilih Edit Profile, lalu ubah informasi yang diperlukan seperti nama, email, atau nomor telepon. Klik Save Changes untuk menyimpan perubahan.'
        },
        {
            category: 'Akun',
            question: 'Apakah data saya aman?',
            answer: 'Keamanan data Anda adalah prioritas kami. Semua data pribadi dan hasil tes disimpan dengan enkripsi dan hanya dapat diakses oleh Anda. Kami tidak akan membagikan informasi Anda kepada pihak ketiga tanpa persetujuan.'
        },
        {
            category: 'Sertifikat',
            question: 'Bagaimana cara download sertifikat?',
            answer: 'Setelah menyelesaikan tes, buka menu Reports, pilih hasil tes yang ingin Anda download, lalu klik tombol Download Sertifikat. Sertifikat akan tersimpan di perangkat Anda dalam format PDF.'
        },
        {
            category: 'Afiliasi',
            question: 'Apa itu program afiliasi?',
            answer: 'Program afiliasi Mahirku memungkinkan Anda mendapatkan komisi dengan mengajak orang lain bergabung. Bagikan link referral Anda dan dapatkan reward setiap kali ada yang mendaftar atau melakukan pembelian melalui link Anda.'
        },
        {
            category: 'Afiliasi',
            question: 'Bagaimana cara withdraw komisi?',
            answer: 'Buka dashboard Affiliator, pilih menu Withdraw, masukkan nominal dan detail rekening bank, lalu submit permintaan. Tim kami akan memproses withdrawal Anda dalam 1-3 hari kerja.'
        },
    ];

    const filteredFAQs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const categories = Array.from(new Set(faqs.map(faq => faq.category)));

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
                        <Feather name="help-circle" size={32} color="#FFF" style={{ marginBottom: 8 }} />
                        <Text style={styles.headerTitle}>FAQ</Text>
                        <Text style={styles.headerSubtitle}>Pertanyaan yang Sering Ditanyakan</Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Feather name="search" size={18} color="#64748B" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Cari pertanyaan..."
                        placeholderTextColor="#94A3B8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery ? (
                        <Pressable onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                            <Feather name="x" size={16} color="#64748B" />
                        </Pressable>
                    ) : null}
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
                {categories.map((category) => {
                    const categoryFAQs = filteredFAQs.filter(faq => faq.category === category);
                    if (categoryFAQs.length === 0) return null;

                    return (
                        <View key={category} style={{ marginBottom: 24 }}>
                            <Text style={styles.categoryTitle}>{category}</Text>
                            {categoryFAQs.map((faq, index) => {
                                const globalIndex = faqs.indexOf(faq);
                                return (
                                    <FAQAccordionItem
                                        key={globalIndex}
                                        question={faq.question}
                                        answer={faq.answer}
                                        isExpanded={expandedIndex === globalIndex}
                                        onPress={() => setExpandedIndex(expandedIndex === globalIndex ? null : globalIndex)}
                                    />
                                );
                            })}
                        </View>
                    );
                })}

                {filteredFAQs.length === 0 && (
                    <Card style={styles.emptyCard}>
                        <Feather name="search" size={48} color="#CBD5E1" />
                        <Text style={styles.emptyTitle}>Tidak ditemukan</Text>
                        <Text style={styles.emptyText}>
                            Coba kata kunci lain atau hubungi support kami
                        </Text>
                    </Card>
                )}

                {/* Contact Support */}
                <Card style={styles.supportCard}>
                    <View style={styles.supportIconWrap}>
                        <Feather name="message-circle" size={20} color="#4F46E5" />
                    </View>
                    <Text style={styles.supportTitle}>Masih ada pertanyaan?</Text>
                    <Text style={styles.supportText}>
                        Tim support kami siap membantu Anda.{'\n'}Hubungi kami di:
                    </Text>
                    <Text style={styles.supportContact}>support@mahirku.com</Text>
                </Card>
            </ScrollView>
        </View>
    );
}

function FAQAccordionItem({ question, answer, isExpanded, onPress }: {
    question: string;
    answer: string;
    isExpanded: boolean;
    onPress: () => void;
}) {
    const heightAnim = useSharedValue(0);
    const rotateAnim = useSharedValue(0);

    React.useEffect(() => {
        heightAnim.value = withTiming(isExpanded ? 1 : 0, {
            duration: 300,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        });
        rotateAnim.value = withTiming(isExpanded ? 180 : 0, {
            duration: 300,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        });
    }, [isExpanded]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: heightAnim.value,
        maxHeight: heightAnim.value * 1000, // Large enough for any content
    }));

    const iconAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotateAnim.value}deg` }],
    }));

    return (
        <Pressable
            style={[styles.accordionCard, isExpanded && styles.accordionCardExpanded]}
            onPress={onPress}
            android_ripple={{ color: '#F1F5F9' }}
        >
            <View style={styles.accordionHeader}>
                <Text style={styles.questionText}>{question}</Text>
                <Animated.View style={[styles.iconCircle, iconAnimatedStyle]}>
                    <Feather name="chevron-down" size={18} color="#4F46E5" />
                </Animated.View>
            </View>

            {isExpanded && (
                <Animated.View style={[styles.answerContainer, animatedStyle]}>
                    <View style={styles.answerDivider} />
                    <Text style={styles.answerText}>{answer}</Text>
                </Animated.View>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingBottom: 24,
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
        marginBottom: 20,
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

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 52,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1E293B',
        height: '100%',
    },
    clearBtn: {
        padding: 4,
    },

    categoryTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#4F46E5',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },

    accordionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    accordionCardExpanded: {
        borderColor: '#E0E7FF',
        backgroundColor: '#FAFBFF',
    },
    accordionHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    questionText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#1E293B',
        lineHeight: 22,
        marginRight: 12,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    answerContainer: {
        overflow: 'hidden',
    },
    answerDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 12,
    },
    answerText: {
        fontSize: 14,
        lineHeight: 24,
        color: '#475569',
        textAlign: 'justify',
    },

    emptyCard: {
        padding: 40,
        alignItems: 'center',
        borderRadius: 20,
        marginTop: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
    },

    supportCard: {
        padding: 24,
        marginTop: 8,
        borderRadius: 20,
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#DBEAFE',
        alignItems: 'center',
    },
    supportIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#DBEAFE',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    supportTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 8,
    },
    supportText: {
        fontSize: 14,
        lineHeight: 22,
        color: '#475569',
        textAlign: 'center',
        marginBottom: 12,
    },
    supportContact: {
        fontSize: 15,
        fontWeight: '600',
        color: '#4F46E5',
    },
});
