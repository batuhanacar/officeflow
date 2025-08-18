import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-hot-toast';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Button, Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert,
    OutlinedInput, Box, Chip, Checkbox, ListItemText
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { format } from 'date-fns';

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated }) => {
    const { user } = useContext(AuthContext);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assigneeIds, setAssigneeIds] = useState([]);
    const [dueDate, setDueDate] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // ROL KONTROLÜ YOK: Modal her açıldığında kullanıcı listesini çek.
            const fetchUsers = async () => {
                try {
                    const response = await axiosInstance.get('/users');
                    setAllUsers(response.data);
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
        setAssigneeIds([]);
        setDueDate(null);
        setError('');
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        if (!title || assigneeIds.length === 0 || !dueDate) {
            toast.error("Lütfen tüm zorunlu alanları doldurun.");
            setIsSubmitting(false);
            return;
        }

        const formattedDueDate = format(dueDate, "yyyy-MM-dd'T'HH:mm:ss");

        axiosInstance.post('/tasks', {
            title,
            description,
            assigneeIds,
            dueDate: formattedDueDate
        })
            .then(() => {
                toast.success('Görev başarıyla oluşturuldu!');
                onTaskCreated();
                handleClose();
            })
            .catch(err => {
                setError(err.response?.data?.message || 'Görev oluşturulamadı.');
                toast.error(err.response?.data?.message || 'Görev oluşturulamadı.');
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    return (
        <Dialog open={isOpen} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>Yeni Görev Oluştur</DialogTitle>
            <DialogContent>
                <TextField autoFocus margin="dense" label="Başlık" type="text" fullWidth variant="outlined" value={title} onChange={(e) => setTitle(e.target.value)} required sx={{ mb: 2, mt: 1 }} />
                <TextField margin="dense" label="Açıklama" type="text" fullWidth multiline rows={4} variant="outlined" value={description} onChange={(e) => setDescription(e.target.value)} sx={{ mb: 2 }} />

                {/* ROL KONTROLÜ YOK: Bu bölüm artık HERKESE görünür. */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="assignees-select-label">Kullanıcı(lar) Ata</InputLabel>
                    <Select
                        labelId="assignees-select-label"
                        multiple
                        required
                        value={assigneeIds}
                        onChange={(e) => setAssigneeIds(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                        input={<OutlinedInput label="Kullanıcı(lar) Ata" />}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((id) => {
                                    const selectedUser = allUsers.find(u => u.id === id);
                                    return <Chip key={id} label={selectedUser ? selectedUser.fullName : id} />;
                                })}
                            </Box>
                        )}
                    >
                        {allUsers.map((u) => (
                            <MenuItem key={u.id} value={u.id}>
                                <Checkbox checked={assigneeIds.indexOf(u.id) > -1} />
                                <ListItemText primary={u.fullName} />
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