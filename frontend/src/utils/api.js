import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

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
