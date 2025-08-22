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
import UserManagementPage from './pages/UserManagementPage';
import NotesPage from './pages/NotesPage';

function App() {
    const { isAuthenticated, logout, isTeamLead } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Toaster position="top-right" reverseOrder={false} />

            <AppBar
                position="static"
                sx={{
                    background: 'linear-gradient(to right, #ffffff 0%, #e3f2fd 30%, #1976d2 100%)',
                    boxShadow: '0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12)'
                }}
            >
                <Toolbar>
                    <Box component={RouterLink} to={isAuthenticated ? "/dashboard" : "/login"} sx={{ flexGrow: 1 }}>
                        <Box component="img" src="/medya_ve_bilisim.png" alt="HSGM Logo" sx={{ height: 50, width: 'auto', verticalAlign: 'middle' }}/>
                    </Box>
                    {isAuthenticated && (
                        <Box>
                            {/* DEĞİŞİKLİK: Buton renklerini beyaz yapmak için color="inherit" ekledik */}
                            <Button color="inherit" component={RouterLink} to="/dashboard">Görev Listesi</Button>
                            <Button color="inherit" component={RouterLink} to="/calendar">Takvim</Button>
                            <Button color="inherit" component={RouterLink} to="/notes">Notlarım</Button>
                            {isTeamLead && (
                                <Button color="inherit" component={RouterLink} to="/users">Kullanıcı Yönetimi</Button>
                            )}
                            <Button color="inherit" onClick={handleLogout}>Çıkış Yap</Button>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            <Container component="main" sx={{ mt: 4, mb: 4 }}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/tasks/:taskId" element={<ProtectedRoute><TaskDetailPage /></ProtectedRoute>} />
                    <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
                    <Route path="/users" element={<ProtectedRoute><UserManagementPage /></ProtectedRoute>} />
                    <Route path="/notes" element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
                    <Route path="/" element={<LoginPage />} />
                </Routes>
            </Container>
        </Box>
    );
}
export default App;