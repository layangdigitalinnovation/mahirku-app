import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log in ALL environments so crash info is available in logcat/release logs
    console.error('ErrorBoundary caught an error:', error?.message || error);
    console.error('Component stack:', errorInfo?.componentStack);
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'Unknown error';
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.emoji}>⚠️</Text>
            <Text style={styles.title}>Terjadi Kesalahan</Text>
            <Text style={styles.message}>
              Aplikasi mengalami masalah. Silakan coba lagi.
            </Text>
            {this.state.error && (
              <ScrollView style={styles.errorBox}>
                <Text style={styles.errorText}>
                  {__DEV__ ? this.state.error.toString() : errorMessage}
                </Text>
              </ScrollView>
            )}
            <TouchableOpacity style={styles.button} onPress={this.handleRestart}>
              <Text style={styles.buttonText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    color: '#94A3B8',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  errorBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    maxHeight: 120,
    width: '100%',
    marginBottom: 24,
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
