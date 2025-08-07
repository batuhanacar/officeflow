import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

// MUI Bileşenlerini import ediyoruz
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Box
} from '@mui/material';

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [users, setUsers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setDescription('');
            setAssigneeId('');
            setIsLoadingUsers(true);

            const fetchUsers = async () => {
                try {
                    const response = await axiosInstance.get('/users');
                    setUsers(response.data);
                } catch (err) {
                    toast.error('Kullanıcı listesi yüklenemedi.');
                } finally {
                    setIsLoadingUsers(false);
                }
            };
            fetchUsers();
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const promise = axiosInstance.post('/tasks', {
            title,
            description,
            assigneeId: Number(assigneeId)
        });

        toast.promise(
            promise,
            {
                loading: 'Görev oluşturuluyor...',
                success: (response) => {
                    onTaskCreated(response.data);
                    onClose();
                    return 'Görev başarıyla oluşturuldu!';
                },
                error: 'Görev oluşturulamadı. Lütfen tüm alanları kontrol edin.'
            }
        ).finally(() => setIsSubmitting(false));
    };

    return (
        <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Yeni Görev Oluştur</DialogTitle>
            <Box component="form" onSubmit={handleSubmit}>
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
                    />
                    <FormControl fullWidth margin="dense" required disabled={isSubmitting || isLoadingUsers}>
                        <InputLabel id="assignee-select-label">Kullanıcı Ata</InputLabel>
                        <Select
                            labelId="assignee-select-label"
                            id="assignee-select"
                            value={assigneeId}
                            label="Kullanıcı Ata"
                            onChange={(e) => setAssigneeId(e.target.value)}
                        >
                            {isLoadingUsers ? (
                                <MenuItem disabled><em>Kullanıcılar yükleniyor...</em></MenuItem>
                            ) : (
                                users.map(user => (
                                    <MenuItem key={user.id} value={user.id}>{user.fullName}</MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: '0 24px 20px' }}>
                    <Button onClick={onClose} disabled={isSubmitting}>İptal</Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={24} /> : 'Oluştur'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default CreateTaskModal;