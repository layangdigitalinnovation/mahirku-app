import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import {
    Box,
    Button,
    Container,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    Typography,
    LinearProgress,
    Alert,
    Paper,
    Chip
} from '@mui/material';
import { ChevronLeft } from 'lucide-react';

interface Option {
    id: number;
    text: string;
    value: string;
}

interface Question {
    id: number;
    question_order: number;
    options: Option[];
}

const DiscTest: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<{ [key: number]: number }>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentGroup, setCurrentGroup] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const response = await api.get('/disc/questions');
            setQuestions(response.data);
        } catch (err) {
            setError('Failed to load questions. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionChange = (questionId: number, optionId: number) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionId
        }));
    };

    const handleNext = () => {
        const totalGroups = Math.ceil(questions.length / 4);
        if (currentGroup < totalGroups - 1) {
            setCurrentGroup(currentGroup + 1);
        }
    };

    const handlePrevious = () => {
        if (currentGroup > 0) {
            setCurrentGroup(currentGroup - 1);
        }
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < questions.length) {
            setError('Please answer all questions before submitting.');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const answersArray = Object.values(answers);
            const response = await api.post('/disc/submit', { answers: answersArray });
            navigate('/customer/dashboard/disc-result', { state: { result: response.data.result } });
        } catch (err) {
            setError('Failed to submit test. Please try again.');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <LinearProgress />;
    }

    // Group questions into sets of 4
    const questionGroups: Question[][] = [];
    for (let i = 0; i < questions.length; i += 4) {
        questionGroups.push(questions.slice(i, i + 4));
    }

    const currentQuestions = questionGroups[currentGroup] || [];
    const progress = (Object.keys(answers).length / questions.length) * 100;
    const totalGroups = questionGroups.length;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 2 }}>
                <Button 
                    startIcon={<ChevronLeft size={20} />} 
                    onClick={() => navigate('/customer/dashboard/test')}
                    color="inherit"
                    sx={{ textTransform: 'none', fontWeight: 'bold' }}
                >
                    Kembali
                </Button>
            </Box>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                    DISC Personality Test
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                    Pilih salah satu opsi yang paling menggambarkan diri Anda di setiap barisnya.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Pastikan Anda berada di situasi yang tenang agar hasilnya dapat optimal.
                </Typography>
            </Box>

            <Box sx={{ mb: 4, position: 'sticky', top: 0, zIndex: 1, bgcolor: 'background.default', py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Progress: {Object.keys(answers).length} / {questions.length} questions
                    </Typography>
                    <Chip
                        label={`Group ${currentGroup + 1} of ${totalGroups}`}
                        color="primary"
                        size="small"
                    />
                </Box>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
                    Pilih satu kata yang paling menggambarkan diri Anda di setiap baris
                </Typography>

                {/* 2x2 Grid Layout */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {currentQuestions.map((question, index) => (
                        <Box key={question.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Chip
                                    label={`Baris ${index + 1}`}
                                    size="small"
                                    color="secondary"
                                    sx={{ mr: 2 }}
                                />
                                {answers[question.id] && (
                                    <Typography variant="caption" color="success.main" fontWeight="bold">
                                        ✓ Terjawab
                                    </Typography>
                                )}
                            </Box>
                            <FormControl component="fieldset" fullWidth>
                                <RadioGroup
                                    name={`question-${question.id}`}
                                    value={answers[question.id] || ''}
                                    onChange={(e) => handleOptionChange(question.id, parseInt(e.target.value))}
                                >
                                    <Box sx={{
                                        display: 'grid',
                                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                                        gap: 2
                                    }}>
                                        {question.options
                                            .sort((a, b) => a.value.localeCompare(b.value))
                                            .map((option) => (
                                                <Box key={option.id}>
                                                    <FormControlLabel
                                                        value={option.id}
                                                        control={<Radio />}
                                                        label={option.text}
                                                        sx={{
                                                            width: '100%',
                                                            m: 0,
                                                            p: 2,
                                                            border: '2px solid',
                                                            borderColor: answers[question.id] === option.id
                                                                ? 'primary.main'
                                                                : 'divider',
                                                            borderRadius: 2,
                                                            bgcolor: answers[question.id] === option.id
                                                                ? 'primary.light'
                                                                : 'background.paper',
                                                            transition: 'all 0.2s',
                                                            '&:hover': {
                                                                bgcolor: answers[question.id] === option.id
                                                                    ? 'primary.light'
                                                                    : 'action.hover',
                                                                borderColor: 'primary.main',
                                                                transform: 'translateY(-2px)',
                                                                boxShadow: 2
                                                            },
                                                        }}
                                                    />
                                                </Box>
                                            ))}
                                    </Box>
                                </RadioGroup>
                            </FormControl>
                        </Box>
                    ))}
                </Box>
            </Paper>

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Button
                    variant="outlined"
                    onClick={handlePrevious}
                    disabled={currentGroup === 0}
                    sx={{ px: 4 }}
                >
                    Previous
                </Button>

                {currentGroup < totalGroups - 1 ? (
                    <Button
                        variant="contained"
                        onClick={handleNext}
                        sx={{ px: 4 }}
                    >
                        Next Group
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        color="success"
                        size="large"
                        onClick={handleSubmit}
                        disabled={submitting || Object.keys(answers).length < questions.length}
                        sx={{ px: 8, py: 1.5, borderRadius: 2 }}
                    >
                        {submitting ? 'Submitting...' : 'Submit Test'}
                    </Button>
                )}
            </Box>
        </Container>
    );
};

export default DiscTest;
