import axios from 'axios';

const reviewsApi = axios.create({
  baseURL: 'http://127.0.0.1:5003',
  headers: { 'Content-Type': 'application/json' }
});

reviewsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.debug('[reviewsApi] adding Authorization header');
  } else {
    console.debug('[reviewsApi] no token in localStorage');
  }
  return config;
});

reviewsApi.interceptors.response.use(
  (resp) => resp,
  (error) => {
    console.debug('[reviewsApi] response error', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export const reviewsAPI = {
  getReviewsByUser: async (userId) => {
    const res = await reviewsApi.get(`/reviews/user/${userId}`);
    return res.data;
  },
  getReviewsByBook: async (bookId) => {
    const res = await reviewsApi.get(`/reviews/book/${bookId}`);
    return res.data;
  },
  getBookStats: async (bookId) => {
    const res = await reviewsApi.get(`/reviews/book/${bookId}/stats`);
    return res.data;
  }
  ,
  createReview: async (payload) => {
    const res = await reviewsApi.post('/reviews', payload);
    return res.data;
  }
  ,
  updateReview: async (reviewId, payload) => {
    const res = await reviewsApi.put(`/reviews/${reviewId}`, payload);
    return res.data;
  },
  deleteReview: async (reviewId) => {
    const res = await reviewsApi.delete(`/reviews/${reviewId}`);
    return res.data;
  },
  deleteReviewsByBook: async (bookId) => {
    const res = await reviewsApi.delete(`/reviews/book/${bookId}`);
    return res.data;
  }
};

export default reviewsAPI;
