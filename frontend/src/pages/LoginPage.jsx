import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

import {
    Container,
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Alert
} from '@mui/material';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // API temel URL'sini ortam değişkeninden al
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

            const response = await axios.post(`${apiBaseUrl}/auth/login`, {
                username,
                password
            });
            login(response.data.token);
            navigate('/dashboard');
        } catch (err) {
            console.error("Giriş hatası:", err);
            setError("Kullanıcı adı veya şifre yanlış. Lütfen tekrar deneyin.");
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper
                elevation={6}
                sx={{
                    marginTop: 8,
                    padding: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: '16px'
                }}
            >
                <Box
                    component="img"
                    src="/medya_ve_bilisim.png"
                    alt="Medya ve Bilişim Koordinatörlüğü Logosu"
                    sx={{
                        width: 'auto',
                        height: 80,
                        marginBottom: 2
                    }}
                />

                <Typography component="h1" variant="h6" align="center" sx={{ mt: 2 }}>
                    T.C. Sağlık Bakanlığı
                </Typography>
                <Typography component="h2" variant="subtitle1" align="center" color="text.secondary">
                    Halk Sağlığı Genel Müdürlüğü
                </Typography>
                <Typography component="h3" variant="subtitle2" align="center" color="text.secondary" sx={{ mb: 2 }}>
                    Medya ve Bilişim Koordinatörlüğü
                </Typography>

                <Typography component="h1" variant="h5" sx={{mb: 2}}>
                    Görev Takip Sistemi
                </Typography>

                <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Kullanıcı Adı"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Şifre"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, py: 1.5 }}
                    >
                        Giriş Yap
                    </Button>
                </Box>
            </Paper>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 5 }}>
                {'Copyright © '}
                HSGM Medya ve Bilişim Koordinatörlüğü
                {' '}
                {new Date().getFullYear()}
                {'.'}
            </Typography>
        </Container>
    );
};

export default LoginPage;