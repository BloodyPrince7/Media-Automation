import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

export const getPosts = async (status = null) => {
  const params = status ? { status } : {};
  const res = await api.get('/posts', { params });
  return res.data;
};

export const getPost = async (id) => {
  const res = await api.get(`/posts/${id}`);
  return res.data;
};

export const createPost = async (postData) => {
  const res = await api.post('/posts', postData);
  return res.data;
};

export const updatePost = async (id, postData) => {
  const res = await api.put(`/posts/${id}`, postData);
  return res.data;
};

export const deletePost = async (id) => {
  const res = await api.delete(`/posts/${id}`);
  return res.data;
};

export const publishPostNow = async (id) => {
  const res = await api.post(`/posts/${id}/publish`);
  return res.data;
};

export const uploadMedia = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const validateContent = async (payload) => {
  const res = await api.post('/validate', payload);
  return res.data;
};

export const getSettings = async () => {
  const res = await api.get('/settings');
  return res.data;
};

export const updateSettings = async (settingsData) => {
  const res = await api.post('/settings', settingsData);
  return res.data;
};

export const aiAdaptContent = async (payload) => {
  const res = await api.post('/ai/adapt', payload);
  return res.data;
};

export default api;
