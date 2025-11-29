import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Pagination,
    Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
    getAdminDiscQuestions,
    createDiscQuestion,
    updateDiscQuestion,
    deleteDiscQuestion,
    DiscQuestion,
    DiscOption,
} from '../../services/api/discAdmin';

const DiscQuestionsManagement: React.FC = () => {
    const [questions, setQuestions] = useState<DiscQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Dialog states
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
    const [currentQuestion, setCurrentQuestion] = useState<DiscQuestion | null>(null);
    const [questionOrder, setQuestionOrder] = useState('');
    const [options, setOptions] = useState<DiscOption[]>([
        { text: '', value: 'D' },
        { text: '', value: 'I' },
        { text: '', value: 'S' },
        { text: '', value: 'C' },
    ]);

    // Delete confirmation dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);

    useEffect(() => {
        fetchQuestions();
    }, [page]);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const data = await getAdminDiscQuestions(page, 10);
            setQuestions(data.questions);
            setTotalPages(data.pagination.totalPages);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load questions');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateDialog = () => {
        setDialogMode('create');
        setQuestionOrder('');
        setOptions([
            { text: '', value: 'D' },
            { text: '', value: 'I' },
            { text: '', value: 'S' },
            { text: '', value: 'C' },
        ]);
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (question: DiscQuestion) => {
        setDialogMode('edit');
        setCurrentQuestion(question);
        setQuestionOrder(question.question_order.toString());
        setOptions(question.options.map(opt => ({ text: opt.text, value: opt.value })));
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentQuestion(null);
        setError(null);
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index].text = value;
        setOptions(newOptions);
    };

    const handleSubmit = async () => {
        try {
            setError(null);

            // Validation
            if (!questionOrder || isNaN(parseInt(questionOrder))) {
                setError('Question order must be a valid number');
                return;
            }

            if (options.some(opt => !opt.text.trim())) {
                setError('All options must have text');
                return;
            }

            if (dialogMode === 'create') {
                await createDiscQuestion({
                    question_order: parseInt(questionOrder),
                    options,
                });
                setSuccess('Question created successfully');
            } else if (currentQuestion) {
                await updateDiscQuestion(currentQuestion.id, {
                    question_order: parseInt(questionOrder),
                    options,
                });
                setSuccess('Question updated successfully');
            }

            handleCloseDialog();
            fetchQuestions();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save question');
        }
    };

    const handleDeleteClick = (id: number) => {
        setQuestionToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (questionToDelete) {
            try {
                await deleteDiscQuestion(questionToDelete);
                setSuccess('Question deleted successfully');
                setDeleteDialogOpen(false);
                setQuestionToDelete(null);
                fetchQuestions();
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to delete question');
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    DISC Questions Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreateDialog}
                >
                    Add Question
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order</TableCell>
                            <TableCell>D Option</TableCell>
                            <TableCell>I Option</TableCell>
                            <TableCell>S Option</TableCell>
                            <TableCell>C Option</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : questions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No questions found
                                </TableCell>
                            </TableRow>
                        ) : (
                            questions.map((question) => {
                                const dOption = question.options.find(o => o.value === 'D');
                                const iOption = question.options.find(o => o.value === 'I');
                                const sOption = question.options.find(o => o.value === 'S');
                                const cOption = question.options.find(o => o.value === 'C');

                                return (
                                    <TableRow key={question.id}>
                                        <TableCell>{question.question_order}</TableCell>
                                        <TableCell>{dOption?.text || '-'}</TableCell>
                                        <TableCell>{iOption?.text || '-'}</TableCell>
                                        <TableCell>{sOption?.text || '-'}</TableCell>
                                        <TableCell>{cOption?.text || '-'}</TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleOpenEditDialog(question)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteClick(question.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                />
            </Box>

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {dialogMode === 'create' ? 'Create New Question' : 'Edit Question'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Question Order"
                            type="number"
                            value={questionOrder}
                            onChange={(e) => setQuestionOrder(e.target.value)}
                            sx={{ mb: 3 }}
                        />

                        <Typography variant="h6" gutterBottom>
                            Options
                        </Typography>

                        <Alert severity="info" sx={{ mb: 2 }}>
                            <strong>Important:</strong> Use single words or short phrases (1-3 words max) that describe personality traits.
                            <br />
                            Examples: "Tegas", "Antusias", "Sabar", "Teliti"
                            <br />
                            ❌ Avoid long sentences like "Saya akan mengambil keputusan dengan cepat"
                        </Alert>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                            {options.map((option, index) => (
                                <Box key={option.value}>
                                    <TextField
                                        fullWidth
                                        label={`${option.value} - ${option.value === 'D' ? 'Dominance' :
                                                option.value === 'I' ? 'Influence' :
                                                    option.value === 'S' ? 'Steadiness' : 'Compliance'
                                            }`}
                                        value={option.text}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        placeholder={
                                            option.value === 'D' ? 'e.g., Tegas, Berani, Kompetitif' :
                                                option.value === 'I' ? 'e.g., Antusias, Ramah, Optimis' :
                                                    option.value === 'S' ? 'e.g., Sabar, Tenang, Stabil' :
                                                        'e.g., Analitis, Teliti, Hati-hati'
                                        }
                                        helperText="1-3 words max"
                                    />
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {dialogMode === 'create' ? 'Create' : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this question? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default DiscQuestionsManagement;
