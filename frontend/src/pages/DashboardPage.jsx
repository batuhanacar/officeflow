import React, { useContext, useEffect, useState, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import CreateTaskModal from '../components/CreateTaskModal';
import {
    Box, Button, Typography, CircularProgress, Alert, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Chip, TextField, TableSortLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import { getStatusChipColor, STATUS_TRANSLATIONS } from '../utils/statusUtils';
import { toast } from 'react-hot-toast';

const DashboardPage = () => {
    const { user, isTeamLead } = useContext(AuthContext);
    const navigate = useNavigate();
    const [allTasks, setAllTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'createdDate', direction: 'desc' });

    const fetchTasks = async () => {
        try {
            setIsLoading(true);
            const endpoint = isTeamLead ? '/tasks/all' : '/tasks/my-tasks';
            const response = await axiosInstance.get(endpoint);
            setAllTasks(Array.isArray(response.data) ? response.data : []);
            setError('');
        } catch (err) {
            setError("Görevler yüklenirken bir hata oluştu.");
            setAllTasks([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchTasks();
        }
    }, [user, isTeamLead]);

    const displayedTasks = useMemo(() => {
        let filteredTasks = [...allTasks];
        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLocaleLowerCase('tr-TR');
            filteredTasks = filteredTasks.filter(task =>
                task.title.toLocaleLowerCase('tr-TR').includes(lowercasedFilter) ||
                task.assignees?.some(assignee =>
                    assignee.fullName.toLocaleLowerCase('tr-TR').includes(lowercasedFilter)
                )
            );
        }
        if (sortConfig.key) {
            filteredTasks.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];
                if (sortConfig.key === 'assignees') {
                    aValue = a.assignees?.[0]?.fullName || '';
                    bValue = b.assignees?.[0]?.fullName || '';
                }
                let comparison = 0;
                if (aValue == null) comparison = 1;
                else if (bValue == null) comparison = -1;
                else if (typeof aValue === 'string' && typeof bValue === 'string') {
                    comparison = aValue.localeCompare(bValue, 'tr-TR');
                } else {
                    if (aValue < bValue) comparison = -1;
                    else if (aValue > bValue) comparison = 1;
                }
                return sortConfig.direction === 'descending' ? -comparison : comparison;
            });
        }
        return filteredTasks;
    }, [allTasks, searchTerm, sortConfig]);

    const handleSort = (key) => {
        const isAsc = sortConfig.key === key && sortConfig.direction === 'ascending';
        setSortConfig({ key, direction: isAsc ? 'desc' : 'asc' });
    };

    const handleTaskCreated = () => { fetchTasks(); };
    const handleRowClick = (taskId) => { navigate(`/tasks/${taskId}`); };
    const canCreateTask = true;

    const handleExportExcel = async () => {
        toast.loading('Rapor hazırlanıyor...');
        try {
            const response = await axiosInstance.get('/tasks/export/excel', {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'gorev-listesi.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.dismiss();
            toast.success("Rapor başarıyla indirildi!");
        } catch (err) {
            toast.dismiss();
            toast.error("Rapor indirilirken bir hata oluştu.");
        }
    };

    // YENİ PDF FONKSİYONU
    const handleExportPdf = async () => {
        toast.loading('PDF hazırlanıyor...');
        try {
            const response = await axiosInstance.get('/tasks/export/pdf', {
                responseType: 'blob',
            });
            const file = new Blob([response.data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL); // PDF'i yeni sekmede aç
            toast.dismiss();
            toast.success("PDF başarıyla oluşturuldu!");
        } catch (err) {
            toast.dismiss();
            toast.error("PDF oluşturulurken bir hata oluştu.");
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" component="h1">
                    Görev Listesi
                </Typography>
                <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
                    {isTeamLead && (
                        <>
                            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportExcel}>
                                Excel'e Aktar
                            </Button>
                            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportPdf}>
                                PDF'e Aktar
                            </Button>
                        </>
                    )}
                    {canCreateTask && (
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsModalOpen(true)}>Yeni Görev Ekle</Button>
                    )}
                </Box>
            </Box>

            <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    label="Görev Başlığı veya Atanan Kişiye Göre Filtrele"
                    placeholder="Arama yapın..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </Paper>

            {isLoading && <CircularProgress />}
            {error && <Alert severity="error">{error}</Alert>}

            {!isLoading && !error && (
                <Paper elevation={3}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><TableSortLabel active={sortConfig.key === 'title'} direction={sortConfig.direction} onClick={() => handleSort('title')}>Görev Başlığı</TableSortLabel></TableCell>
                                    <TableCell><TableSortLabel active={sortConfig.key === 'assignees'} direction={sortConfig.direction} onClick={() => handleSort('assignees')}>Atanan Kişi(ler)</TableSortLabel></TableCell>
                                    <TableCell><TableSortLabel active={sortConfig.key === 'createdDate'} direction={sortConfig.direction} onClick={() => handleSort('createdDate')}>Oluşturulma Tarihi</TableSortLabel></TableCell>
                                    <TableCell><TableSortLabel active={sortConfig.key === 'dueDate'} direction={sortConfig.direction} onClick={() => handleSort('dueDate')}>Son Teslim Tarihi</TableSortLabel></TableCell>
                                    <TableCell>Durum</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {displayedTasks.length > 0 ? (
                                    displayedTasks.map((task) => (
                                        <TableRow key={task.id} hover onClick={() => handleRowClick(task.id)} sx={{ cursor: 'pointer' }}>
                                            <TableCell>{task.title}</TableCell>
                                            <TableCell>{task.assignees && task.assignees.length > 0 ? task.assignees.map(a => a.fullName).join(', ') : 'Atanmamış'}</TableCell>
                                            <TableCell>{task.createdDate ? new Date(task.createdDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}</TableCell>
                                            <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}</TableCell>
                                            <TableCell><Chip label={STATUS_TRANSLATIONS[task.status] || task.status} color={getStatusChipColor(task.status)} size="small" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={5} align="center">Arama kriterlerine uygun görev bulunamadı.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onTaskCreated={handleTaskCreated} />
        </Box>
    );
};

export default DashboardPage;