import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
    Container, Paper, Typography, Box, CircularProgress, Alert, Button,
    Chip, Divider, ButtonGroup, TextField, List, ListItem, ListItemText,
    ListItemAvatar, Avatar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import { getStatusChipColor, STATUS_TRANSLATIONS, STATUS_OPTIONS } from '../utils/statusUtils';

const TaskDetailPage = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const { user, isTeamLead } = useContext(AuthContext);

    const [task, setTask] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);

    const fetchTaskAndComments = async () => {
        setIsLoading(true);
        try {
            const taskPromise = axiosInstance.get(`/tasks/${taskId}`);
            const commentsPromise = axiosInstance.get(`/tasks/${taskId}/comments`);

            const [taskResponse, commentsResponse] = await Promise.all([taskPromise, commentsPromise]);

            setTask(taskResponse.data);
            setComments(commentsResponse.data);
            setError('');
        } catch (err) {
            setError('Görev veya yorumlar yüklenemedi.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (taskId) {
            fetchTaskAndComments();
        }
    }, [taskId]);

    const updateStatus = async (newStatus) => {
        try {
            const response = await axiosInstance.put(`/tasks/${taskId}/status`, { status: newStatus });
            setTask(response.data);
            toast.success(`Görev durumu "${STATUS_TRANSLATIONS[newStatus]}" olarak güncellendi.`);
        } catch (err) {
            toast.error("Durum güncellenirken bir hata oluştu.");
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Bu görevi silmek istediğinizden emin misiniz?")) {
            try {
                await axiosInstance.delete(`/tasks/${taskId}`);
                toast.success("Görev başarıyla silindi.");
                navigate('/dashboard');
            } catch (err) {
                toast.error("Görev silinirken bir hata oluştu.");
            }
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setIsCommentSubmitting(true);
        try {
            const response = await axiosInstance.post(`/tasks/${taskId}/comments`, { content: newComment });
            setComments(prevComments => [response.data, ...prevComments]);
            setNewComment('');
            toast.success("Yorum eklendi.");
        } catch (err) {
            toast.error("Yorum eklenirken bir hata oluştu.");
        } finally {
            setIsCommentSubmitting(false);
        }
    };

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!task) return <Alert severity="warning">Görev bulunamadı.</Alert>;

    const isOwner = user && task.assignees?.some(assignee => assignee.username === user.username);

    return (
        <Container maxWidth="md">
            <Button component={RouterLink} to="/dashboard" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
                Geri Dön
            </Button>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>{task.title}</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                    <Chip
                        label={STATUS_TRANSLATIONS[task.status] || task.status}
                        color={getStatusChipColor(task.status)}
                    />
                    <Typography variant="subtitle1" color="text.secondary">
                        Atanan Kişi(ler): {
                        task.assignees && task.assignees.length > 0
                            ? task.assignees.map(a => a.fullName).join(', ')
                            : 'Atanmamış'
                    }
                    </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">Oluşturulma: {new Date(task.createdDate).toLocaleString('tr-TR')}</Typography>
                {task.dueDate && <Typography variant="caption" display="block" color="text.secondary">Son Teslim: {new Date(task.dueDate).toLocaleString('tr-TR')}</Typography>}
                <Divider sx={{ my: 3 }} />
                <Typography variant="body1" sx={{ minHeight: '100px', whiteSpace: 'pre-wrap' }}>{task.description || "Bu görev için bir açıklama girilmemiş."}</Typography>

                {(isTeamLead || isOwner) && (
                    <>
                        <Divider sx={{ my: 3 }} />
                        <Box>
                            <Typography variant="h6" gutterBottom>Durumu Değiştir</Typography>
                            <ButtonGroup variant="outlined">
                                {STATUS_OPTIONS.map(option => (
                                    <Button
                                        key={option.key}
                                        onClick={() => updateStatus(option.key)}
                                        disabled={task.status === option.key}
                                    >
                                        {option.text}
                                    </Button>
                                ))}
                            </ButtonGroup>
                        </Box>
                    </>
                )}

                <Divider sx={{ my: 3 }} />

                <Box>
                    <Typography variant="h6" gutterBottom>Yorumlar</Typography>
                    <Box component="form" onSubmit={handleAddComment} sx={{ mb: 2 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                            label="Yorumunuzu yazın..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <Button type="submit" variant="contained" sx={{ mt: 1 }} disabled={isCommentSubmitting}>
                            {isCommentSubmitting ? <CircularProgress size={24} /> : "Yorum Ekle"}
                        </Button>
                    </Box>
                    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                        {comments.length > 0 ? comments.map(comment => (
                            <ListItem key={comment.id} alignItems="flex-start">
                                <ListItemAvatar>
                                    <Avatar>{comment.authorFullName.charAt(0).toUpperCase()}</Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={comment.authorFullName}
                                    secondary={
                                        <>
                                            <Typography component="span" variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
                                                {comment.content}
                                            </Typography>
                                            <br />
                                            <Typography component="span" variant="caption" color="text.secondary">
                                                {new Date(comment.createdAt).toLocaleString('tr-TR')}
                                            </Typography>
                                        </>
                                    }
                                />
                            </ListItem>
                        )) : <Typography variant="body2" color="text.secondary">Henüz hiç yorum yapılmamış.</Typography>}
                    </List>
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