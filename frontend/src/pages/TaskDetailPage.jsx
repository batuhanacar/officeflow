import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

import {
    Container,
    Paper,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Button,
    Chip,
    Divider,
    ButtonGroup
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';

const TaskDetailPage = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [task, setTask] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const updateStatus = (newStatus) => {
        const promise = axiosInstance.put(`/tasks/${taskId}/status`, { status: newStatus });

        toast.promise(promise, {
            loading: 'Durum güncelleniyor...',
            success: (response) => {
                setTask(response.data);
                return 'Durum başarıyla güncellendi!';
            },
            error: 'Durum güncellenemedi.'
        });
    };

    const handleDelete = () => {
        if (window.confirm("Bu görevi silmek istediğinizden emin misiniz?")) {
            const promise = axiosInstance.delete(`/tasks/${taskId}`);

            toast.promise(promise, {
                loading: 'Görev siliniyor...',
                success: () => {
                    navigate('/dashboard');
                    return 'Görev başarıyla silindi!';
                },
                error: 'Görev silinemedi.'
            });
        }
    };

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const response = await axiosInstance.get(`/tasks/${taskId}`);
                setTask(response.data);
            } catch (err) {
                setError('Görev yüklenemedi.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchTask();
    }, [taskId]);

    const isTeamLead = user && user.role === 'ROLE_TEAM_LEAD';

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!task) return <Alert severity="warning">Görev bulunamadı.</Alert>;

    return (
        <Container maxWidth="md">
            <Button component={RouterLink} to="/dashboard" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
                Geri Dön
            </Button>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {task.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                    <Chip
                        label={task.status.replace('_', ' ')}
                        color={task.status === 'DONE' ? 'success' : (task.status === 'IN_PROGRESS' ? 'primary' : 'default')}
                    />
                    <Typography variant="subtitle1" color="text.secondary">
                        Atanan: {task.assignee.fullName}
                    </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                    Oluşturulma: {new Date(task.createdDate).toLocaleString()}
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography variant="body1" sx={{ minHeight: '100px' }}>
                    {task.description || "Bu görev için bir açıklama girilmemiş."}
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Box>
                    <Typography variant="h6" gutterBottom>Durumu Değiştir</Typography>
                    <ButtonGroup variant="outlined" aria-label="outlined button group">
                        <Button onClick={() => updateStatus('TODO')} disabled={task.status === 'TODO'}>Yapılacak</Button>
                        <Button onClick={() => updateStatus('IN_PROGRESS')} disabled={task.status === 'IN_PROGRESS'}>Yapılıyor</Button>
                        <Button onClick={() => updateStatus('DONE')} disabled={task.status === 'DONE'}>Tamamlandı</Button>
                    </ButtonGroup>
                </Box>

                {isTeamLead && (
                    <Box sx={{ mt: 4, p: 2, border: '1px dashed red' }}>
                        <Typography variant="h6" color="error">Tehlikeli Alan</Typography>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={handleDelete}
                            sx={{ mt: 1 }}
                        >
                            Görevi Kalıcı Olarak Sil
                        </Button>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default TaskDetailPage;