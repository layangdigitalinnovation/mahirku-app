import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { meApi } from '../api/auth';
import { transferTokenToChild } from '../api/childUser';
import PrimaryButton from '../components/basic/PrimaryButton';
import TextField from '../components/basic/TextField';
import Card from '../components/basic/Card';

export default function TransferTokenScreen({ navigation, route }: any) {
    const { member } = route.params;
    const insets = useSafeAreaInsets();
    const queryClient = useQueryClient();
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');

    const { data: meData } = useQuery({
        queryKey: ['me'],
        queryFn: async () => (await meApi()).data
    });

    const userTokens = meData?.user?.tokens ?? 0;

    const transferMut = useMutation({
        mutationFn: transferTokenToChild,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['me'] });
            queryClient.invalidateQueries({ queryKey: ['childrenUsers'] });
            Alert.alert('Berhasil', `Berhasil mengirim ${amount} token ke ${member.fullname || member.username}`, [
                { text: 'Selesai', onPress: () => navigation.goBack() }
            ]);
        },
        onError: (err: any) => {
            Alert.alert('Gagal', err?.response?.data?.message || 'Terjadi kesalahan saat transfer');
        }
    });

    const handleSend = () => {
        const val = parseInt(amount);
        if (!amount || isNaN(val) || val <= 0) {
            Alert.alert('Invalid', 'Masukkan jumlah token yang valid');
            return;
        }
        if (val > userTokens) {
            Alert.alert('Saldo Kurang', 'Saldo token Anda tidak mencukupi');
            return;
        }

        Alert.alert(
            'Konfirmasi Transfer',
            `Kirim ${val} token ke ${member.fullname || member.username}?`,
            [
                { text: 'Batal', style: 'cancel' },
                { text: 'Kirim', onPress: () => transferMut.mutate({ childId: member.id, tokenAmount: val }) }
            ]
        );
    };

    const getInitials = (name: string) => name?.split(' ').slice(0, 2).map(s => s[0]?.toUpperCase() || '').join('') || '??';

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={24} color="#1E293B" />
                </Pressable>
                <Text style={styles.headerTitle}>Konfirmasi Transfer</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24 }}>

                {/* Source Section */}
                <View style={styles.sectionLabelRow}>
                    <Text style={styles.sectionLabel}>Dari Kantong Utama</Text>
                </View>
                <Card style={styles.sourceCard}>
                    <View style={styles.walletIcon}>
                        <MaterialCommunityIcons name="wallet-outline" size={24} color="#F59E0B" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>Saldo Token</Text>
                        <Text style={styles.cardSubtitle}>{userTokens} Token Tersedia</Text>
                    </View>
                    <View style={styles.checkIcon}>
                        <Feather name="check" size={16} color="#FFFFFF" />
                    </View>
                </Card>

                {/* Connector Line */}
                <View style={styles.connectorContainer}>
                    <View style={styles.connectorLine} />
                    <View style={styles.connectorArrow}>
                        <Feather name="chevron-down" size={20} color="#94A3B8" />
                    </View>
                </View>

                {/* Destination Section */}
                <View style={styles.sectionLabelRow}>
                    <Text style={styles.sectionLabel}>Ke Akun Member</Text>
                </View>
                <Card style={styles.destCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{getInitials(member.fullname || member.username)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{member.fullname || member.username}</Text>
                        <Text style={styles.cardSubtitle}>{member.email}</Text>
                    </View>
                </Card>

                {/* Input Section */}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Jumlah Token</Text>
                    <View style={styles.amountWrapper}>
                        <TextField
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0"
                            keyboardType="number-pad"
                            containerStyle={{ flex: 1 }}
                            inputStyle={styles.amountInput}
                            autoFocus
                        />
                        <Text style={styles.currencyLabel}>Token</Text>
                    </View>
                </View>

                {/* Note Input (Optional) */}
                <TextField
                    value={note}
                    onChangeText={setNote}
                    placeholder="Tulis catatan (opsional)"
                    startIcon={<Feather name="edit-2" size={18} color="#94A3B8" />}
                    containerStyle={{ marginTop: 16 }}
                />

            </ScrollView>

            {/* Footer Action */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
            >
                <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Pengiriman:</Text>
                        <Text style={styles.totalValue}>{amount ? `${amount} Token` : '-'}</Text>
                    </View>
                    <PrimaryButton
                        title="Kirim Sekarang"
                        onPress={handleSend}
                        loading={transferMut.isPending}
                        style={styles.sendBtn}
                        textStyle={{ fontSize: 16, fontWeight: '700' }}
                    />
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
    },
    sectionLabelRow: { marginBottom: 12 },
    sectionLabel: { fontSize: 14, color: '#64748B', fontWeight: '600' },
    sourceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 16,
        elevation: 2,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    destCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 16,
        elevation: 2,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    walletIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFFBEB',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FEF3C7'
    },
    checkIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center'
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E0E7FF'
    },
    avatarText: { fontSize: 16, fontWeight: '700', color: '#4F46E5' },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
    cardSubtitle: { fontSize: 13, color: '#64748B' },

    connectorContainer: { alignItems: 'center', height: 40, justifyContent: 'center' },
    connectorLine: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: '#E2E8F0' },
    connectorArrow: { backgroundColor: '#F8FAFC', padding: 4, borderRadius: 12, zIndex: 1 },

    inputContainer: { marginTop: 32 },
    inputLabel: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 12 },
    amountWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16
    },
    amountInput: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1E293B',
        height: 60,
        backgroundColor: 'transparent',
        borderWidth: 0
    },
    currencyLabel: { fontSize: 16, fontWeight: '600', color: '#64748B' },

    footer: {
        padding: 24,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    totalLabel: { fontSize: 15, color: '#64748B' },
    totalValue: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
    sendBtn: { height: 56, borderRadius: 16, backgroundColor: '#F59E0B' }
});
