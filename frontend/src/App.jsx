import React, { useContext } from 'react';
import { Routes, Route, Link as RouterLink } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import TaskDetailPage from './pages/TaskDetailPage';

function App() {
    const { isAuthenticated, logout } = useContext(AuthContext);

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Toaster position="top-right" reverseOrder={false} />

            <AppBar position="static">
                <Toolbar>
                    <Typography
                        variant="h6"
                        component={RouterLink}
                        to="/dashboard"
                        sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}
                    >
                        OfficeFlow
                    </Typography>
                    {isAuthenticated && (
                        <Button color="inherit" onClick={logout}>Çıkış Yap</Button>
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
                    <Route path="/" element={<LoginPage />} />
                </Routes>
            </Container>
        </Box>
    );
}

export default App;