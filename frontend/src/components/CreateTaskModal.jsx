import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-hot-toast';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Button, Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { format } from 'date-fns';

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [dueDate, setDueDate] = useState(null);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchUsers = async () => {
                try {
                    const response = await axiosInstance.get('/users');
                    setUsers(response.data);
                } catch (err) {
                    toast.error('Kullanıcı listesi yüklenemedi.');
                }
            };
            fetchUsers();
        }
    }, [isOpen]);

    const handleClose = () => {
        setTitle('');
        setDescription('');
        setAssigneeId('');
        setDueDate(null);
        setError('');
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        if (!dueDate || !assigneeId) {
            toast.error("Lütfen tüm zorunlu alanları doldurun.");
            setIsSubmitting(false);
            return;
        }

        const formattedDueDate = format(dueDate, "yyyy-MM-dd'T'HH:mm:ss");

        axiosInstance.post('/tasks', {
            title,
            description,
            assigneeId: Number(assigneeId),
            dueDate: formattedDueDate
        })
            .then(response => {
                toast.success('Görev başarıyla oluşturuldu!');
                onTaskCreated();
                handleClose();
            })
            .catch(err => {
                const errorMessage = err.response?.data?.message || 'Görev oluşturulamadı.';
                toast.error(errorMessage);
                setError(errorMessage);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    return (
        <Dialog open={isOpen} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>Yeni Görev Oluştur</DialogTitle>
            <DialogContent>
                <TextField autoFocus margin="dense" label="Görev Başlığı" type="text" fullWidth variant="outlined" value={title} onChange={(e) => setTitle(e.target.value)} required sx={{ mb: 2, mt: 1 }} />
                <TextField margin="dense" label="Açıklama" type="text" fullWidth multiline rows={4} variant="outlined" value={description} onChange={(e) => setDescription(e.target.value)} sx={{ mb: 2 }} />
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="assignee-select-label">Kullanıcı Ata</InputLabel>
                    <Select
                        labelId="assignee-select-label"
                        value={assigneeId}
                        label="Kullanıcı Ata"
                        onChange={(e) => setAssigneeId(e.target.value)}
                        required
                    >
                        <MenuItem value="" disabled>Bir kullanıcı seçin...</MenuItem>
                        {users.map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                                {user.fullName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <DateTimePicker
                    label="Son Teslim Tarihi"
                    value={dueDate}
                    onChange={(newValue) => setDueDate(newValue)}
                    sx={{ width: '100%' }}
                    slotProps={{ textField: { required: true } }}
                />
                {error && <Alert severity="error" sx={{mt: 2}}>{error}</Alert>}
            </DialogContent>
            <DialogActions sx={{ p: '0 24px 24px' }}>
                <Button onClick={handleClose} disabled={isSubmitting}>İptal</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={24} /> : 'Oluştur'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateTaskModal;