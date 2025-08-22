import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-hot-toast';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Button, Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert
} from '@mui/material';

const CreateUserModal = ({ isOpen, onClose, onUserCreated }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('ROLE_USER');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleClose = () => {
        setUsername('');
        setPassword('');
        setFullName('');
        setRole('ROLE_USER');
        setError('');
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            await axiosInstance.post('/users/register', {
                username,
                password,
                fullName,
                role
            });
            toast.success('Kullanıcı başarıyla oluşturuldu!');
            onUserCreated();
            handleClose();
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Kullanıcı oluşturulamadı.';
            toast.error(errorMessage);
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>Yeni Kullanıcı Oluştur</DialogTitle>
            <DialogContent>
                <TextField autoFocus margin="dense" label="Tam Adı" type="text" fullWidth variant="outlined" value={fullName} onChange={(e) => setFullName(e.target.value)} required sx={{ mb: 2, mt: 1 }} />
                <TextField margin="dense" label="Kullanıcı Adı" type="text" fullWidth variant="outlined" value={username} onChange={(e) => setUsername(e.target.value)} required sx={{ mb: 2 }} />
                <TextField margin="dense" label="Şifre" type="password" fullWidth variant="outlined" value={password} onChange={(e) => setPassword(e.target.value)} required sx={{ mb: 2 }} />
                <FormControl fullWidth>
                    <InputLabel id="role-select-label">Rol</InputLabel>
                    <Select value={role} label="Rol" onChange={(e) => setRole(e.target.value)}>
                        <MenuItem value={'ROLE_USER'}>Kullanıcı</MenuItem>
                        <MenuItem value={'ROLE_TEAM_LEAD'}>Takım Lideri</MenuItem>
                    </Select>
                </FormControl>
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

export default CreateUserModal;