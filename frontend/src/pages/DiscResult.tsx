import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Typography,
    Paper,
    Divider
} from '@mui/material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface DiscResultData {
    dScore: number;
    iScore: number;
    sScore: number;
    cScore: number;
    dominantType: string;
}

const DiscResult: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const result = location.state?.result as DiscResultData;

    if (!result) {
        return (
            <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom>
                    No result found.
                </Typography>
                <Button variant="contained" onClick={() => navigate('/customer/dashboard')}>
                    Go to Dashboard
                </Button>
            </Container>
        );
    }

    const data = {
        labels: ['Dominance', 'Influence', 'Steadiness', 'Compliance'],
        datasets: [
            {
                label: 'Score',
                data: [result.dScore, result.iScore, result.sScore, result.cScore],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'DISC Personality Profile',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 40, // Max possible score per category if all questions align (unlikely but safe upper bound)
            }
        }
    };

    const getTypeDescription = (type: string) => {
        switch (type) {
            case 'D': return 'Dominance: Direct, firm, strong-willed, force-ful, results-oriented.';
            case 'I': return 'Influence: Outgoing, enthusiastic, optimistic, high-spirited, lively.';
            case 'S': return 'Steadiness: Even-tempered, accommodating, patient, humble, tactful.';
            case 'C': return 'Compliance: Analytical, reserved, precise, private, systematic.';
            default: return '';
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                        Your DISC Profile
                    </Typography>
                    <Typography variant="h6" color="primary">
                        Dominant Type: {result.dominantType}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2, fontStyle: 'italic' }}>
                        {getTypeDescription(result.dominantType)}
                    </Typography>
                </Box>

                <Divider sx={{ my: 4 }} />

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                    <Box sx={{ flex: { xs: '1 1 auto', md: 2 }, height: 400 }}>
                        <Bar options={options} data={data} />
                    </Box>
                    <Box sx={{ flex: { xs: '1 1 auto', md: 1 } }}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Detailed Scores
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box>
                                        <Typography variant="subtitle2">Dominance (D)</Typography>
                                        <Typography variant="h4">{result.dScore}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2">Influence (I)</Typography>
                                        <Typography variant="h4">{result.iScore}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2">Steadiness (S)</Typography>
                                        <Typography variant="h4">{result.sScore}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2">Compliance (C)</Typography>
                                        <Typography variant="h4">{result.cScore}</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>

                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Button variant="contained" size="large" onClick={() => navigate('/customer/dashboard')}>
                        Back to Dashboard
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default DiscResult;
