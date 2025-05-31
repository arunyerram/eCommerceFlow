import axios from 'axios';
const apiClient = axios.create({ baseURL: 'http://localhost:5000/api' });
export const fetchAllProducts = () => apiClient.get('/products').then(res => res.data);
export const createOrder = (orderData) => apiClient.post('/orders', orderData).then(res => res.data);
export const fetchOrder = (orderNumber) => apiClient.get(`/orders/${orderNumber}`).then(res => res.data);
