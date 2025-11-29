import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Button, Card, RadioButton, ProgressBar, ActivityIndicator, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getDiscQuestions, submitDiscTest, DiscQuestion } from '../api/disc';

const { width } = Dimensions.get('window');

const DiscTestScreen = () => {
    const [questions, setQuestions] = useState<DiscQuestion[]>([]);
    const [answers, setAnswers] = useState<{ [key: number]: number }>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const navigation = useNavigation<any>();
    const theme = useTheme();

    useEffect(() => {
        loadQuestions();
    }, []);

    const loadQuestions = async () => {
        try {
            const data = await getDiscQuestions();
            setQuestions(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load questions. Please try again.');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (questionId: number, optionId: number) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionId
        }));
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < questions.length) {
            Alert.alert('Incomplete', 'Please answer all questions before submitting.');
            return;
        }

        setSubmitting(true);
        try {
            const answersArray = Object.values(answers);
            const response = await submitDiscTest(answersArray);
            navigation.replace('DiscResult', { result: response.result });
        } catch (error) {
            Alert.alert('Error', 'Failed to submit test. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const progress = questions.length > 0 ? Object.keys(answers).length / questions.length : 0;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#4c669f', '#3b5998', '#192f6a']}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>DISC Personality Test</Text>
                        <Text style={styles.headerSubtitle}>Discover your personality type</Text>
                    </View>
                </View>

                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>Progress: {Math.round(progress * 100)}%</Text>
                    <ProgressBar progress={progress} color="#fff" style={styles.progressBar} />
                </View>
            </LinearGradient>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {loading ? (
                    // Skeleton loading - show immediately
                    [1, 2, 3, 4, 5].map((item) => (
                        <Card key={item} style={styles.card} mode="elevated">
                            <Card.Content>
                                <View style={styles.skeletonLine} />
                                <View style={[styles.skeletonLine, { width: '70%' }]} />
                                <View style={styles.skeletonOption} />
                                <View style={styles.skeletonOption} />
                                <View style={styles.skeletonOption} />
                                <View style={styles.skeletonOption} />
                            </Card.Content>
                        </Card>
                    ))
                ) : (
                    // Actual questions
                    questions.map((question, index) => (
                        <Card key={question.id} style={styles.card} mode="elevated">
                            <Card.Content>
                                <Text style={styles.questionNumber}>Question {index + 1}</Text>
                                <Text style={styles.instruction}>Select the word that best describes you:</Text>

                                <RadioButton.Group
                                    onValueChange={value => handleOptionSelect(question.id, parseInt(value))}
                                    value={answers[question.id]?.toString()}
                                >
                                    <View style={styles.optionsContainer}>
                                        {question.options.map((option) => (
                                            <View key={option.id} style={styles.optionRow}>
                                                <RadioButton.Android value={option.id.toString()} />
                                                <Text style={styles.optionText} onPress={() => handleOptionSelect(question.id, option.id)}>
                                                    {option.text}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </RadioButton.Group>
                            </Card.Content>
                        </Card>
                    ))
                )}

                {!loading && (
                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        loading={submitting}
                        disabled={submitting || Object.keys(answers).length < questions.length}
                        style={styles.submitButton}
                        contentStyle={{ height: 50 }}
                    >
                        Submit Test
                    </Button>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 20,
        paddingTop: 50,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 4,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    backButton: {
        marginRight: 12,
        padding: 4,
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 15,
    },
    progressContainer: {
        marginTop: 10,
    },
    progressText: {
        color: '#fff',
        marginBottom: 5,
        fontSize: 12,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: '#fff',
    },
    questionNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    instruction: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    optionsContainer: {
        marginTop: 5,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    optionText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    submitButton: {
        marginTop: 10,
        borderRadius: 8,
        backgroundColor: '#3b5998',
    },
    skeletonLine: {
        height: 16,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        marginBottom: 12,
        opacity: 0.6,
    },
    skeletonOption: {
        height: 40,
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
        marginBottom: 8,
        opacity: 0.4,
    },
});

export default DiscTestScreen;
