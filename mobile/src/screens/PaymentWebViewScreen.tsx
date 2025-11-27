import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentWebViewScreen({ navigation, route }: any) {
    const insets = useSafeAreaInsets();
    const { paymentUrl, invoiceId } = route.params;
    const [loading, setLoading] = useState(true);

    const handleNavigationStateChange = (navState: any) => {
        const { url } = navState;
        if (url.includes('payment-success') && url.includes('status=success')) {
            navigation.replace('PaymentSuccess', { invoiceId });
        }
    };

    const onShouldStartLoadWithRequest = (request: any) => {
        const { url } = request;
        if (url.includes('payment-success') && url.includes('status=success')) {
            navigation.replace('PaymentSuccess', { invoiceId });
            return false;
        }
        return true;
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
                <Pressable style={styles.closeBtn} onPress={() => navigation.replace('PaymentStatus', { invoiceId, paymentUrl })}>
                    <Ionicons name="close" size={24} color="#0F172A" />
                </Pressable>
                <Text style={styles.topTitle}>Payment</Text>
                <View style={{ width: 40 }} />
            </View>
            <View style={{ flex: 1 }}>
                <WebView
                    source={{ uri: paymentUrl }}
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                    onNavigationStateChange={handleNavigationStateChange}
                    onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
                    onError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                        // Catch connection refused error for localhost redirect
                        if ((nativeEvent.code === -6 || nativeEvent.description === 'net::ERR_CONNECTION_REFUSED') &&
                            nativeEvent.url?.includes('payment-success') &&
                            nativeEvent.url?.includes('status=success')) {
                            navigation.replace('PaymentSuccess', { invoiceId });
                        }
                    }}
                    style={{ flex: 1 }}
                />
                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#4F46E5" />
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#F1F5F9' },
    topTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
    loadingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.8)' },
});
