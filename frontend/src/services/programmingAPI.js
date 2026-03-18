import api from './api';

export const programmingAPI = {
  getAll: (params) => api.get('/programming', { params }),
  getQuestion: (id) => api.get(`/programming/${id}`),
  runCode: (data) => api.post('/programming/run', data),
  submitCode: (data) => api.post('/programming/submit', data),
  getSections: () => api.get('/programming/sections'),
  getTopics: (section) => api.get(`/programming/topics/${section}`)
};

export const adminProgrammingAPI = {

  getAll: (params) => api.get('/programming', { params }),
  addQuestion: (data) => api.post('/programming', data),
  updateQuestion: (id, data) => api.put(`/programming/${id}`, data),
  deleteQuestion: (id) => api.delete(`/programming/${id}`),
  toggleQuestion: (id) => api.patch(`/programming/${id}/toggle`)

};

