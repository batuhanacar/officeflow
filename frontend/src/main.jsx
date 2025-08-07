import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // EKLEDİK

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            {/* AuthProvider'ı BrowserRouter'un içine, App bileşeninin dışına koyuyoruz.
          Böylece App ve onun altındaki tüm bileşenler AuthContext'e erişebilir. */}
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>,
);