import axiosClient from './axiosClient';

export const getDashboard = async () => (await axiosClient.get('/dashboard')).data;
