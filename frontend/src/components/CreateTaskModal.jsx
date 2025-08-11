import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-hot-toast';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Alert
} from '@mui/material';

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setDescription('');
            setAssigneeId('');
            setError('');

            const fetchUsers = async () => {
                try {
                    const response = await axiosInstance.get('/users');
                    setUsers(response.data);
                } catch (err) {
                    setError('Kullanıcı listesi yüklenemedi.');
                }
            };
            fetchUsers();
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const response = await axiosInstance.post('/tasks', {
                title,
                description,
                assigneeId: Number(assigneeId)
            });
            toast.success('Görev başarıyla oluşturuldu!');
            onTaskCreated(response.data);
            onClose();
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Görev oluşturulamadı. Lütfen tekrar deneyin.';
            toast.error(errorMessage);
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Yeni Görev Oluştur</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="title"
                    label="Görev Başlığı"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    sx={{ mb: 2, mt: 1 }}
                />
                <TextField
                    margin="dense"
                    id="description"
                    label="Açıklama"
                    type="text"
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <FormControl fullWidth>
                    <InputLabel id="assignee-select-label">Kullanıcı Ata</InputLabel>
                    <Select
                        labelId="assignee-select-label"
                        id="assignee-select"
                        value={assigneeId}
                        label="Kullanıcı Ata"
                        onChange={(e) => setAssigneeId(e.target.value)}
                        required
                    >
                        <MenuItem value="" disabled>
                            Bir kullanıcı seçin...
                        </MenuItem>
                        {users.map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                                {user.fullName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {error && <Alert severity="error" sx={{mt: 2}}>{error}</Alert>}
            </DialogContent>
            <DialogActions sx={{ p: '0 24px 24px' }}>
                <Button onClick={onClose} disabled={isSubmitting}>İptal</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={24} /> : 'Oluştur'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateTaskModal;