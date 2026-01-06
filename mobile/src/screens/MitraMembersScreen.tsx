import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { getMitraMembers, promoteToAffiliator, type MitraMember } from '../api/mitra';
import PrimaryButton from '../components/basic/PrimaryButton';
import Card from '../components/basic/Card';
import { LinearGradient } from 'expo-linear-gradient';

export default function MitraMembersScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading, isRefetching } = useQuery({
        queryKey: ['mitraMembers', debouncedSearch],
        queryFn: () => getMitraMembers({ search: debouncedSearch, limit: 100 }), // Simplified pagination for now
    });

    const promoteMut = useMutation({
        mutationFn: promoteToAffiliator,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mitraMembers'] });
            Alert.alert('Berhasil', 'Member berhasil dipromosikan menjadi Affiliator.');
        },
        onError: (err: any) => {
            Alert.alert('Gagal', err?.response?.data?.message || 'Gagal mempromosikan member.');
        }
    });

    const handlePromote = (member: MitraMember) => {
        Alert.alert(
            'Konfirmasi',
            `Jadikan ${member.fullname} sebagai Affiliator?`,
            [
                { text: 'Batal', style: 'cancel' },
                { text: 'Ya, Jadikan Affiliator', onPress: () => promoteMut.mutate(member.id) }
            ]
        );
    };

    const getInitials = (name: string) => name?.split(' ').slice(0, 2).map(s => s[0]?.toUpperCase() || '').join('') || '??';

    const renderItem = ({ item }: { item: MitraMember }) => {
        const isAffiliator = item.role?.name === 'affiliator';

        return (
            <Card style={styles.memberCard}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{getInitials(item.fullname)}</Text>
                    </View>

                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.memberName}>{item.fullname || item.username}</Text>
                            <View style={[styles.roleBadge, isAffiliator ? styles.roleBadgeAffiliate : styles.roleBadgeUser]}>
                                <Text style={[styles.roleText, isAffiliator ? styles.roleTextAffiliate : styles.roleTextUser]}>
                                    {isAffiliator ? 'Affiliator' : 'User'}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.memberEmail}>{item.email}</Text>

                        <View style={styles.statsRow}>
                            <View>
                                <Text style={styles.statsLabel}>Bergabung</Text>
                                <Text style={styles.statsValue}>{new Date(item.createdAt).toLocaleDateString('id-ID')}</Text>
                            </View>
                            <View>
                                <Text style={styles.statsLabel}>Komisi Dihasilkan</Text>
                                <Text style={styles.statsValueCommission}>Rp {(item.totalCommissionGenerated || 0).toLocaleString('id-ID')}</Text>
                            </View>
                        </View>

                        {!isAffiliator && (
                            <Pressable
                                onPress={() => handlePromote(item)}
                                style={({ pressed }) => [styles.promoteBtn, pressed && { opacity: 0.8 }]}
                            >
                                <MaterialCommunityIcons name="star-circle-outline" size={16} color="#6366F1" />
                                <Text style={styles.promoteBtnText}>Jadikan Affiliator</Text>
                            </Pressable>
                        )}
                        {isAffiliator && (
                            <View style={styles.statusDone}>
                                <Feather name="check" size={14} color="#10B981" />
                                <Text style={styles.statusDoneText}>Sudah Affiliator</Text>
                            </View>
                        )}
                    </View>
                </View>
            </Card>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Simple Header for Tab Screen context */}
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <View>
                    <Text style={styles.title}>Daftar Anggota</Text>
                    <Text style={styles.subtitle}>Kelola anggota grup Anda</Text>
                </View>
            </View>

            <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
                <View style={styles.searchContainer}>
                    <Feather name="search" size={20} color="#94A3B8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Cari nama atau email..."
                        placeholderTextColor="#94A3B8"
                        value={search}
                        onChangeText={setSearch}
                    />
                    {search.length > 0 && (
                        <Pressable onPress={() => setSearch('')}>
                            <Feather name="x" size={18} color="#94A3B8" />
                        </Pressable>
                    )}
                </View>
            </View>

            <FlatList
                data={data?.data?.data}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 20, paddingTop: 8 }}
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyState}>
                            <Feather name="users" size={48} color="#CBD5E1" />
                            <Text style={styles.emptyText}>Tidak ada anggota ditemukan</Text>
                        </View>
                    ) : null
                }
                ListFooterComponent={isLoading ? <ActivityIndicator color="#6366F1" style={{ marginTop: 20 }} /> : null}
            />

            <View style={[styles.fabContainer, { bottom: 24 }]}>
                <Pressable
                    onPress={() => navigation.navigate('AddMember')}
                    style={styles.fab}
                >
                    <LinearGradient
                        colors={['#6366F1', '#4F46E5']}
                        style={styles.fabGradient}
                    >
                        <Feather name="plus" size={24} color="#FFFFFF" />
                        <Text style={styles.fabText}>Tambah</Text>
                    </LinearGradient>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 24,
        paddingBottom: 20,
        backgroundColor: '#F8FAFC',
    },
    title: { fontSize: 24, fontWeight: '800', color: '#1E293B', letterSpacing: -0.5 },
    subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1E293B' },

    memberCard: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
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
    avatarText: { fontSize: 18, fontWeight: '700', color: '#6366F1' },
    memberName: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    memberEmail: { fontSize: 13, color: '#64748B', marginBottom: 12 },

    roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginLeft: 8 },
    roleBadgeUser: { backgroundColor: '#F1F5F9' },
    roleBadgeAffiliate: { backgroundColor: '#F5F3FF', borderWidth: 1, borderColor: '#EDE9FE' },
    roleText: { fontSize: 11, fontWeight: '600' },
    roleTextUser: { color: '#64748B' },
    roleTextAffiliate: { color: '#7C3AED' },

    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, backgroundColor: '#F8FAFC', padding: 10, borderRadius: 10 },
    statsLabel: { fontSize: 11, color: '#94A3B8', marginBottom: 2 },
    statsValue: { fontSize: 13, fontWeight: '600', color: '#334155' },
    statsValueCommission: { fontSize: 13, fontWeight: '700', color: '#10B981' },

    promoteBtn: {
        flexDirection: 'row', // Updated to handle flex layout properly
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E7FF',
        backgroundColor: '#F5F8FF',
        gap: 6
    },
    promoteBtnText: { fontSize: 13, fontWeight: '600', color: '#6366F1' },

    statusDone: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    statusDoneText: { fontSize: 13, color: '#10B981', fontWeight: '500' },

    emptyState: { alignItems: 'center', paddingTop: 60 },
    emptyText: { color: '#94A3B8', marginTop: 12 },

    fabContainer: { position: 'absolute', right: 20 },
    fab: { overflow: 'hidden', borderRadius: 28, elevation: 6, shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    fabGradient: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, gap: 8 },
    fabText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 }
});
