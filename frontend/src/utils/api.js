import axios from 'axios';

// 1. Define the root domain (Live Render URL or Local Node Server)
// Make sure you do NOT put a trailing slash at the end of your Render URL in Vercel.
const DOMAIN = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// 2. Create the Axios instance with the full base URL
const API = axios.create({
  baseURL: `${DOMAIN}/api`, // This ensures every call starts with http://.../api
  headers: { 'Content-Type': 'application/json' },
});

// ==========================================
// API Endpoints
// ==========================================

// Customers
export const getCustomers = () => API.get('/customers');
export const createCustomer = (data) => API.post('/customers', data);
export const updateCustomer = (id, data) => API.put(`/customers/${id}`, data);

// Items
export const getItems = () => API.get('/items');
export const createItem = (data) => API.post('/items', data);
export const updateItem = (code, data) => API.put(`/items/${code}`, data);

// Invoices
export const getInvoices = (params) => API.get('/invoices', { params });
export const getInvoice = (id) => API.get(`/invoices/${id}`);
export const createInvoice = (data) => API.post('/invoices', data);
export const getStats = () => API.get('/invoices/stats/summary');

export default API;