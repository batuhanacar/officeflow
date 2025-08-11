import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// EN GÜNCEL VE DOĞRU İMPORT YOLLARI
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// Adapter, artık paketin bir alt klasöründen import ediliyor.
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                    <App />
                </LocalizationProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>,
);