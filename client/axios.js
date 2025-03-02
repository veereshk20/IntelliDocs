import axios from 'axios';

const base_url = import.meta.env.VITE_BACKEND_URL;

const axiosInstance = axios.create({
    baseURL: base_url,
});

axiosInstance.interceptors.request.use(
    (response) => response,
    (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong'),

);

export default axiosInstance;