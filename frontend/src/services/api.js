
// frontend/src/services/api.js

import axios from 'axios';

// In production, REACT_APP_API_URL will be set to https://ecommerceflow-1.onrender.com
// Locally (npm start), it will fall back to http://localhost:5000
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: `${API_BASE}/api`,
});

export const fetchAllProducts = () =>
  apiClient.get('/products').then((res) => res.data);

export const createOrder = (orderData) =>
  apiClient.post('/orders', orderData).then((res) => res.data);

export const fetchOrder = (orderNumber) =>
  apiClient.get(`/orders/${orderNumber}`).then((res) => res.data);
