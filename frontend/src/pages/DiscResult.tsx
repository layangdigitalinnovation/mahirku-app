import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Card as MuiCard,
    CardContent as MuiCardContent,
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
import { TrendingUp, LogOut, Brain, CheckCircle, Shield, Zap, Briefcase } from 'lucide-react';
import { useMeQuery } from '@/hooks/useAuthQuery';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
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
import { useDiscAiReport } from '@/hooks/useAiReports';

interface DiscResultData {
    id: number;
    dScore: number;
    iScore: number;
    sScore: number;
    cScore: number;
    dominantType: string;
    fullname?: string;
}

export interface DiscAiReportData {
  profile_summary: string;
  communication_style: string;
  behavior_traits: string[];
  strengths: string[];
  challenges: string[];
  work_environment: string;
  career_recommendations: string[];
  collaboration_tips: string[];
  conflict_risks: string[];
  dev_tips: string[];
}

const AiReportSection = ({ resultId }: { resultId: number }) => {
  const { data: aiReport } = useDiscAiReport(resultId);

  const report = aiReport?.report as DiscAiReportData | undefined;
  if (!report || typeof report !== 'object') return null;

  const renderList = (items?: string[]) => {
    if (!items || !Array.isArray(items)) return null;
    return (
      <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    );
  };

  return (
    <div className="mt-8 mb-4">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Brain className="h-6 w-6 text-blue-600" />
        Detail Laporan Assessment
      </h3>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6 h-auto p-1 bg-slate-100 rounded-xl">
          <TabsTrigger value="overview" className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg flex gap-2 text-sm font-medium">
            <Brain className="w-4 h-4" /> <span className="hidden sm:inline">Ringkasan</span>
          </TabsTrigger>
          <TabsTrigger value="character" className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg flex gap-2 text-sm font-medium">
            <Zap className="w-4 h-4" /> <span className="hidden sm:inline">Karakter</span>
          </TabsTrigger>
          <TabsTrigger value="career" className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg flex gap-2 text-sm font-medium">
            <Briefcase className="w-4 h-4" /> <span className="hidden sm:inline">Karir & Kerja</span>
          </TabsTrigger>
          <TabsTrigger value="development" className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg flex gap-2 text-sm font-medium">
            <TrendingUp className="w-4 h-4" /> <span className="hidden sm:inline">Pengembangan</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-0 animate-in fade-in-50 duration-500">
          <Card className="border-l-4 border-l-blue-500 bg-slate-50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <h4 className="font-bold text-slate-900 mb-2">Ringkasan Profil</h4>
              <p className="text-slate-700 leading-relaxed text-sm">{report.profile_summary}</p>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-indigo-500 bg-indigo-50/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h4 className="font-bold text-indigo-900 mb-2">Gaya Komunikasi Utama</h4>
                <p className="text-indigo-800 leading-relaxed text-sm">{report.communication_style}</p>
              </CardContent>
            </Card>

            {report.behavior_traits && (
              <Card className="border-l-4 border-l-teal-500 bg-teal-50/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h4 className="font-bold text-teal-900 mb-2">Karakter Perilaku</h4>
                  <div className="text-sm">
                    {renderList(report.behavior_traits)}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="character" className="space-y-6 mt-0 animate-in fade-in-50 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {report.strengths && (
              <Card className="border-l-4 border-l-emerald-500 bg-emerald-50/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h4 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Kekuatan Utama
                  </h4>
                  <div className="text-sm">
                    {renderList(report.strengths)}
                  </div>
                </CardContent>
              </Card>
            )}

            {report.challenges && (
              <Card className="border-l-4 border-l-amber-500 bg-amber-50/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Tantangan & Titik Buta
                  </h4>
                  <div className="text-sm">
                    {renderList(report.challenges)}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {report.conflict_risks && (
            <Card className="border-l-4 border-l-rose-500 bg-rose-50/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h4 className="font-bold text-rose-900 mb-2">Potensi Konflik</h4>
                <div className="text-sm">
                  {renderList(report.conflict_risks)}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="career" className="space-y-6 mt-0 animate-in fade-in-50 duration-500">
          {report.work_environment && (
            <Card className="border-l-4 border-l-sky-500 bg-sky-50/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h4 className="font-bold text-sky-900 mb-2">Lingkungan Kerja Ideal</h4>
                <p className="text-sky-800 leading-relaxed text-sm">{report.work_environment}</p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {report.career_recommendations && (
              <Card className="border-l-4 border-l-blue-600 bg-blue-50/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h4 className="font-bold text-blue-900 mb-2">Rekomendasi Karir</h4>
                  <div className="text-sm">
                    {renderList(report.career_recommendations)}
                  </div>
                </CardContent>
              </Card>
            )}

            {report.collaboration_tips && (
              <Card className="border-l-4 border-l-fuchsia-500 bg-fuchsia-50/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h4 className="font-bold text-fuchsia-900 mb-2">Tips Kolaborasi</h4>
                  <div className="text-sm">
                    {renderList(report.collaboration_tips)}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="development" className="space-y-6 mt-0 animate-in fade-in-50 duration-500">
          {report.dev_tips && (
            <Card className="border-l-4 border-l-purple-500 bg-purple-50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h4 className="font-bold text-purple-900 mb-2">Tips Pengembangan Diri</h4>
                <div className="text-sm">
                  {renderList(report.dev_tips)}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

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
                        DISC Profile {result.fullname && result.fullname !== 'Pengguna' ? result.fullname : 'Anda'}
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
                        <MuiCard variant="outlined">
                            <MuiCardContent>
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
                            </MuiCardContent>
                        </MuiCard>
                    </Box>
                </Box>

                <AiReportSection resultId={result.id} />

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
