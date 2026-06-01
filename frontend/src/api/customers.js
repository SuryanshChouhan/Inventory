import axiosClient from './axiosClient';

export const getCustomers = async () => (await axiosClient.get('/customers')).data;
export const getCustomer = async (id) => (await axiosClient.get(`/customers/${id}`)).data;
export const createCustomer = async (data) => (await axiosClient.post('/customers', data)).data;
export const updateCustomer = async (id, data) => (await axiosClient.put(`/customers/${id}`, data)).data;
export const deleteCustomer = async (id) => (await axiosClient.delete(`/customers/${id}`)).data;
