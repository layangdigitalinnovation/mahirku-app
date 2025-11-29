import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Text, Button, Card, Title, Paragraph, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { DiscResultData } from '../api/disc';

const { width } = Dimensions.get('window');

const DiscResultScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { result } = route.params as { result: DiscResultData };
    const theme = useTheme();

    const getTypeDescription = (type: string) => {
        switch (type) {
            case 'D': return 'Dominance: Direct, firm, strong-willed, force-ful, results-oriented.';
            case 'I': return 'Influence: Outgoing, enthusiastic, optimistic, high-spirited, lively.';
            case 'S': return 'Steadiness: Even-tempered, accommodating, patient, humble, tactful.';
            case 'C': return 'Compliance: Analytical, reserved, precise, private, systematic.';
            default: return '';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'D': return '#FF6384';
            case 'I': return '#36A2EB';
            case 'S': return '#FFCE56';
            case 'C': return '#4BC0C0';
            default: return '#333';
        }
    };

    const maxScore = 40; // Approximate max score for scaling bars

    const ScoreBar = ({ label, score, color }: { label: string, score: number, color: string }) => (
        <View style={styles.scoreRow}>
            <View style={styles.scoreLabelContainer}>
                <Text style={styles.scoreLabel}>{label}</Text>
                <Text style={[styles.scoreValue, { color }]}>{score}</Text>
            </View>
            <View style={styles.barBackground}>
                <View style={[styles.barFill, { width: `${(score / maxScore) * 100}%`, backgroundColor: color }]} />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#4c669f', '#3b5998', '#192f6a']}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Your DISC Profile</Text>
                <Text style={styles.headerSubtitle}>Analysis Result</Text>
            </LinearGradient>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Card style={styles.mainCard}>
                    <Card.Content style={styles.centerContent}>
                        <Text style={styles.dominantLabel}>Dominant Type</Text>
                        <View style={[styles.typeCircle, { borderColor: getTypeColor(result.dominantType) }]}>
                            <Text style={[styles.typeText, { color: getTypeColor(result.dominantType) }]}>
                                {result.dominantType}
                            </Text>
                        </View>
                        <Paragraph style={styles.description}>
                            {getTypeDescription(result.dominantType)}
                        </Paragraph>
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Content>
                        <Title style={styles.sectionTitle}>Detailed Scores</Title>
                        <ScoreBar label="Dominance (D)" score={result.dScore} color="#FF6384" />
                        <ScoreBar label="Influence (I)" score={result.iScore} color="#36A2EB" />
                        <ScoreBar label="Steadiness (S)" score={result.sScore} color="#FFCE56" />
                        <ScoreBar label="Compliance (C)" score={result.cScore} color="#4BC0C0" />
                    </Card.Content>
                </Card>

                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('Dashboard')}
                    style={styles.button}
                    contentStyle={{ height: 50 }}
                >
                    Back to Dashboard
                </Button>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 20,
        paddingTop: 50,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 4,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    mainCard: {
        marginBottom: 16,
        borderRadius: 16,
        elevation: 4,
        alignItems: 'center',
    },
    centerContent: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    dominantLabel: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    typeCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    typeText: {
        fontSize: 48,
        fontWeight: 'bold',
    },
    description: {
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
        color: '#444',
    },
    card: {
        marginBottom: 20,
        borderRadius: 16,
        elevation: 2,
    },
    sectionTitle: {
        marginBottom: 15,
        fontSize: 18,
        fontWeight: 'bold',
    },
    scoreRow: {
        marginBottom: 15,
    },
    scoreLabelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    scoreLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#555',
    },
    scoreValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    barBackground: {
        height: 10,
        backgroundColor: '#eee',
        borderRadius: 5,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 5,
    },
    button: {
        borderRadius: 8,
        backgroundColor: '#3b5998',
    },
});

export default DiscResultScreen;
