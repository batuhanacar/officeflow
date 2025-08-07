import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import CreateTaskModal from '../components/CreateTaskModal';

import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Alert,
    Grid,
    Card,
    CardContent,
    CardActions,
    Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const DashboardPage = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchTasks = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get('/tasks');
            setTasks(response.data);
            setError('');
        } catch (err) {
            console.error("Görevler yüklenirken hata:", err);
            setError("Görevler yüklenirken bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleTaskCreated = (newTask) => {
        setTasks(prevTasks => [...prevTasks, newTask]);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getStatusChipColor = (status) => {
        switch (status) {
            case 'TODO': return 'default';
            case 'IN_PROGRESS': return 'primary';
            case 'DONE': return 'success';
            default: return 'default';
        }
    };

    const isTeamLead = user && user.role === 'ROLE_TEAM_LEAD';

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1">
                    Görev Panosu
                </Typography>
                <div>
                    {isTeamLead && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setIsModalOpen(true)}
                        >
                            Yeni Görev Ekle
                        </Button>
                    )}
                </div>
            </Box>

            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            )}

            {!isLoading && !error && (
                <Grid container spacing={3}>
                    {tasks.length > 0 ? (
                        tasks.map(task => (
                            <Grid item key={task.id} xs={12} sm={6} md={4}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography gutterBottom variant="h5" component="h2">
                                            {task.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Atanan: {task.assignee.fullName}
                                        </Typography>
                                        <Chip
                                            label={task.status.replace('_', ' ')}
                                            color={getStatusChipColor(task.status)}
                                            size="small"
                                            sx={{ mt: 1 }}
                                        />
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="small"
                                            component={RouterLink}
                                            to={`/tasks/${task.id}`}
                                        >
                                            Detayları Gör
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Typography sx={{ ml: 2, width: '100%' }}>
                            Size atanmış bir görev bulunmuyor.
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