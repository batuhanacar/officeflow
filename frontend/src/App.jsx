import React, { useContext } from 'react';
import { Routes, Route, Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import TaskDetailPage from './pages/TaskDetailPage';
import CalendarPage from './pages/CalendarPage';

function App() {
    const { isAuthenticated, logout } = useContext(AuthContext); // isTeamLead'i buradan kaldırdık, artık gerek yok.
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Toaster position="top-right" reverseOrder={false} />

            <AppBar position="static">
                <Toolbar>
                    <Typography
                        variant="h6"
                        component={RouterLink}
                        to={isAuthenticated ? "/dashboard" : "/login"}
                        sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}
                    >
                        OfficeFlow
                    </Typography>

                    {isAuthenticated && (
                        <Box>
                            <Button color="inherit" component={RouterLink} to="/dashboard">Görev Panosu</Button>

                            {/* KURALI KALDIRDIK. Artık bu buton tüm giriş yapmış kullanıcılar için görünür. */}
                            <Button color="inherit" component={RouterLink} to="/calendar">Takvim</Button>

                            <Button color="inherit" onClick={handleLogout}>Çıkış Yap</Button>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            <Container component="main" sx={{ mt: 4, mb: 4 }}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/dashboard"
                        element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
                    />
                    <Route
                        path="/tasks/:taskId"
                        element={<ProtectedRoute><TaskDetailPage /></ProtectedRoute>}
                    />
                    <Route
                        path="/calendar"
                        element={<ProtectedRoute><CalendarPage /></ProtectedRoute>}
                    />
                    <Route path="/" element={<LoginPage />} />
                </Routes>
            </Container>
        </Box>
    );
}

export default App;