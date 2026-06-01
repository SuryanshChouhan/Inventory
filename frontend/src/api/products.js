import axiosClient from './axiosClient';

export const getProducts = async () => (await axiosClient.get('/products')).data;
export const getProduct = async (id) => (await axiosClient.get(`/products/${id}`)).data;
export const createProduct = async (data) => (await axiosClient.post('/products', data)).data;
export const updateProduct = async (id, data) => (await axiosClient.put(`/products/${id}`, data)).data;
export const deleteProduct = async (id) => (await axiosClient.delete(`/products/${id}`)).data;
