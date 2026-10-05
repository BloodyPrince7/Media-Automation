import axios from 'axios';

const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || '';
export const API_BASE_URL = RAW_API_BASE.replace(/\/+$/, '');

export const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  return API_BASE_URL ? `${API_BASE_URL}${url}` : url;
};

const api = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api` : '/api',
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

export const getPostEngagement = async (postId) => {
  const res = await api.get(`/posts/${postId}/engagement`);
  return res.data;
};

export const postComment = async (postId, commentData) => {
  const res = await api.post(`/posts/${postId}/comments`, commentData);
  return res.data;
};

export const aiSuggestReply = async (payload) => {
  const res = await api.post('/ai/suggest-reply', payload);
  return res.data;
};

export const askMediaAdvisor = async (query, history = []) => {
  const res = await api.post('/ai/media-advisor', { query, history });
  return res.data;
};

export const getAnalyticsOverview = async () => {
  const res = await api.get('/analytics/overview');
  return res.data;
};

export const loginUser = async (username_or_email, password) => {
  const res = await api.post('/auth/login', { username_or_email, password });
  return res.data;
};

export const registerUser = async (username, email, password, full_name) => {
  const res = await api.post('/auth/register', { username, email, password, full_name });
  return res.data;
};

export const getCurrentUser = async (token = null) => {
  const params = token ? { token } : {};
  const res = await api.get('/auth/me', { params });
  return res.data;
};

export const logoutUser = async (token = null) => {
  const params = token ? { token } : {};
  const res = await api.post('/auth/logout', null, { params });
  return res.data;
};

export default api;



