import axiosClient from './axiosClient';

export const getOrders = async () => (await axiosClient.get('/orders')).data;
export const getOrder = async (id) => (await axiosClient.get(`/orders/${id}`)).data;
export const createOrder = async (data) => (await axiosClient.post('/orders', data)).data;
export const deleteOrder = async (id) => (await axiosClient.delete(`/orders/${id}`)).data;
