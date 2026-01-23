import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Typography,
    Paper,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import { TrendingUp, LogOut } from 'lucide-react';
import { useMeQuery } from '@/hooks/useAuthQuery';
import { useAuth } from '@/hooks/useAuth';
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
    const { data: userData, refetch: refetchUser } = useMeQuery();
    const user = userData?.user;
    const { logout } = useAuth();
    const [openUpgradeDialog, setOpenUpgradeDialog] = useState(false);

    useEffect(() => {
        refetchUser();
    }, [refetchUser]);

    useEffect(() => {
        if (user?.parent) {
            setOpenUpgradeDialog(true);
        }
    }, [user]);

    const handleLogout = async () => {
        await logout();
    };

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

            {/* Info Upgrade Affiliator */}
            {user?.parent && (
                <Paper
                    elevation={0}
                    sx={{
                        mb: 4,
                        p: 3,
                        background: 'linear-gradient(to right, #FFFBEB, #FFF7ED)', // yellow-50 to orange-50
                        border: '1px solid #FEF08A', // yellow-200
                        borderRadius: 4,
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -40,
                            right: -40,
                            width: 160,
                            height: 160,
                            bgcolor: '#FED7AA', // orange-200
                            borderRadius: '50%',
                            opacity: 0.2,
                            pointerEvents: 'none',
                            filter: 'blur(40px)'
                        }}
                    />
                    <Box sx={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 3, textAlign: { xs: 'center', sm: 'left' } }}>
                        <Box sx={{ flexShrink: 0, p: 2, bgcolor: '#FEF9C3', borderRadius: '50%', color: '#CA8A04', boxShadow: 1 }}>
                            <TrendingUp size={32} />
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" fontWeight="bold" color="#111827" gutterBottom>
                                Selamat! Akun Anda Telah Di-Upgrade
                            </Typography>
                            <Typography variant="body2" color="#374151" sx={{ lineHeight: 1.6 }}>
                                Karena Anda telah menyelesaikan Tes Kepribadian DISC, status akun Anda kini menjadi <Box component="span" fontWeight="bold" color="#A16207">Affiliator</Box>.
                                Anda sekarang memiliki akses ke Dashboard Affiliator untuk mulai menghasilkan pendapatan.
                            </Typography>
                        </Box>
                        <Box sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}>
                            <Button
                                onClick={handleLogout}
                                variant="contained"
                                startIcon={<LogOut size={18} />}
                                sx={{
                                    width: { xs: '100%', sm: 'auto' },
                                    bgcolor: '#CA8A04', // yellow-600
                                    '&:hover': { bgcolor: '#A16207' }, // yellow-700
                                    boxShadow: '0 10px 15px -3px rgba(254, 240, 138, 0.5)',
                                    textTransform: 'none',
                                    fontWeight: 'bold'
                                }}
                            >
                                Logout & Login Kembali
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            )}

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
                    {!user?.parent ? (
                        <Button variant="contained" size="large" onClick={() => navigate('/customer/dashboard')}>
                            Back to Dashboard
                        </Button>
                    ) : (
                        <Button 
                            variant="contained" 
                            size="large" 
                            onClick={handleLogout}
                            startIcon={<LogOut size={20} />}
                            sx={{
                                bgcolor: '#CA8A04',
                                '&:hover': { bgcolor: '#A16207' }
                            }}
                        >
                            Logout & Login ke Dashboard Affiliator
                        </Button>
                    )}
                </Box>
            </Paper>

            <Dialog
                open={openUpgradeDialog}
                onClose={() => setOpenUpgradeDialog(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Selamat! Akun Anda Telah Di-Upgrade"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Karena Anda telah menyelesaikan Tes Kepribadian DISC, status akun Anda kini menjadi <strong>Affiliator</strong>.
                        <br /><br />
                        Silakan <strong>Logout</strong> dan Login kembali untuk mengakses Dashboard Affiliator dan mulai menghasilkan pendapatan.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenUpgradeDialog(false)}>Nanti Saja</Button>
                    <Button onClick={handleLogout} variant="contained" color="primary" autoFocus>
                        Logout Sekarang
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default DiscResult;
