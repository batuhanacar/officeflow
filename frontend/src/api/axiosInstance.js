import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080/api',
});

axiosInstance.interceptors.request.use(
    (config) => {
        // localStorage'dan token'ı al
        const token = localStorage.getItem('token');

        // Eğer token varsa, isteğin 'Authorization' başlığına ekle
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // İstek hatası olursa ne yapılacağı
        return Promise.reject(error);
    }
);

// TODO: Response Interceptor (Cevap Yakalayıcı)
// Bu, bir cevap geldikten sonra araya girer.
// Örneğin, 401 (Unauthorized) hatası alırsak kullanıcıyı otomatik logout yapabiliriz.
// Şimdilik bu kısmı boş bırakıyoruz.

export default axiosInstance;