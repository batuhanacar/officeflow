import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import CreateTaskModal from '../components/CreateTaskModal';
import { Box, Button, Typography, CircularProgress, Alert, Grid, Card, CardContent, CardActions, Chip, FormControlLabel, Switch } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getStatusChipColor, STATUS_TRANSLATIONS } from '../utils/statusUtils';

const DashboardPage = () => {
    const { isTeamLead } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showAllTasks, setShowAllTasks] = useState(false);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                setIsLoading(true);
                const endpoint = isTeamLead && showAllTasks ? '/tasks/all' : '/tasks/my-tasks';
                const response = await axiosInstance.get(endpoint);
                setTasks(response.data);
                setError('');
            } catch (err) {
                setError("Görevler yüklenirken bir hata oluştu.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchTasks();
    }, [showAllTasks, isTeamLead]);

    const handleTaskCreated = () => {
        const fetchTasks = async () => {
            const endpoint = isTeamLead && showAllTasks ? '/tasks/all' : '/tasks/my-tasks';
            const response = await axiosInstance.get(endpoint);
            setTasks(response.data);
        };
        fetchTasks();
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">
                    {isTeamLead && showAllTasks ? "Tüm Görevler" : "Benim Görevlerim"}
                </Typography>
                {isTeamLead && (
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsModalOpen(true)}>
                        Yeni Görev Ekle
                    </Button>
                )}
            </Box>

            {isTeamLead && (
                <FormControlLabel
                    control={<Switch checked={showAllTasks} onChange={(e) => setShowAllTasks(e.target.checked)} />}
                    label="Tüm Görevleri Göster"
                    sx={{ mb: 2 }}
                />
            )}

            {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

            {!isLoading && !error && (
                <Grid container spacing={3}>
                    {tasks.length > 0 ? (
                        tasks.map(task => (
                            <Grid item key={task.id} xs={12} sm={6} md={4}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography gutterBottom variant="h5" component="h2">{task.title}</Typography>
                                        <Typography variant="body2" color="text.secondary">Atanan: {task.assignee.fullName}</Typography>
                                        <Chip
                                            label={STATUS_TRANSLATIONS[task.status] || task.status}
                                            color={getStatusChipColor(task.status)}
                                            size="small"
                                            sx={{ mt: 1 }}
                                        />
                                    </CardContent>
                                    <CardActions>
                                        <Button size="small" component={RouterLink} to={`/tasks/${task.id}`}>
                                            Detayları Gör
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Typography sx={{ ml: 2, width: '100%' }}>
                            {isTeamLead && showAllTasks ? "Sistemde görüntülenecek görev bulunmuyor." : "Size atanmış bir görev bulunmuyor."}
                        </Typography>
                    )}
                </Grid>
            )}

            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onTaskCreated={handleTaskCreated}
            />
        </Box>
    );
};

export default DashboardPage;