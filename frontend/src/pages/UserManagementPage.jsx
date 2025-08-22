import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Alert,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import CreateUserModal from '../components/CreateUserModal';

const UserManagementPage = () => {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get('/users');
            setUsers(response.data);
            setError('');
        } catch (err) {
            setError('Kullanıcılar yüklenirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (userId, usernameToDelete) => {
        if (usernameToDelete === user.username) {
            toast.error("Kendinizi silemezsiniz!");
            return;
        }
        if (window.confirm(`${usernameToDelete} kullanıcısını silmek istediğinizden emin misiniz?`)) {
            try {
                await axiosInstance.delete(`/users/${userId}`);
                toast.success('Kullanıcı başarıyla silindi.');
                fetchUsers();
            } catch (err) {
                toast.error('Kullanıcı silinemedi. Lütfen önce bu kullanıcıya atanmış tüm görevleri silin.');
            }
        }
    };

    const handleCleanup = async () => {
        if (window.confirm("Durumu 'Tamamlandı' olan TÜM görevleri kalıcı olarak silmek istediğinizden emin misiniz?")) {
            try {
                const response = await axiosInstance.delete('/tasks/cleanup-completed');
                toast.success(response.data);
            } catch (err) {
                toast.error("Görevler temizlenirken bir hata oluştu.");
            }
        }
    };

    return (
        // Sayfayı iki ana bölüme ayırmak için Fragment (<>) kullanıyoruz.
        <>
            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" component="h1">
                        Kullanıcı Yönetimi
                    </Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsModalOpen(true)}>
                        Yeni Kullanıcı Ekle
                    </Button>
                </Box>

                {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>}
                {error && <Alert severity="error">{error}</Alert>}

                {!isLoading && !error && (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Tam Adı</TableCell>
                                    <TableCell>Kullanıcı Adı</TableCell>
                                    <TableCell align="right">İşlemler</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((u) => (
                                    <TableRow key={u.id}>
                                        <TableCell>{u.fullName}</TableCell>
                                        <TableCell>{u.username}</TableCell>
                                        <TableCell align="right">
                                            <IconButton onClick={() => handleDelete(u.id, u.username)} color="error" disabled={u.username === user.username}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            <Paper elevation={3} sx={{ p: 2, border: '1px dashed red' }}>
                <Typography variant="h6" color="error" gutterBottom>
                    Tehlikeli Alan
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{flexGrow: 1}}>
                        Sistemdeki durumu "Tamamlandı" olarak işaretlenmiş tüm görevleri kalıcı olarak sil.
                    </Typography>
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteSweepIcon />}
                        onClick={handleCleanup}
                    >
                        Tamamlananları Temizle
                    </Button>
                </Box>
            </Paper>

            <CreateUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUserCreated={fetchUsers}
            />
        </>
    );
};

export default UserManagementPage;