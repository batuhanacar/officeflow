import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { Box, Button, Typography, CircularProgress, Alert, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
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
                toast.error('Kullanıcı silinemedi. Lütfen önce bu kullanıcıya atanmış görevleri silin.');
            }
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">
                    Kullanıcı Yönetimi
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsModalOpen(true)}>
                    Yeni Kullanıcı Ekle
                </Button>
            </Box>

            {isLoading && <CircularProgress />}
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

            <CreateUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUserCreated={fetchUsers}
            />
        </Paper>
    );
};

export default UserManagementPage;