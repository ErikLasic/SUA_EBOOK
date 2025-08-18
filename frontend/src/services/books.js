import axios from 'axios';

// Dedicated axios instance for the books service (port 8000)
const booksApi = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token if present (mirrors src/services/api.js behavior)
booksApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (!token) {
    // helpful debug during development when token isn't present
    console.debug('[booksApi] no token in localStorage');
  } else {
    config.headers.Authorization = `Bearer ${token}`;
    console.debug('[booksApi] attaching token to request', config.url);
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor for logging 401 details from books service
booksApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response) {
      if (err.response.status === 401) {
        console.error('[booksApi] 401 Unauthorized:', err.response.data || err.response.statusText);
        // token invalid/expired -> clear local auth and force login (same behavior as main api)
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        console.warn('[booksApi] Response error', err.response.status, err.response.data);
      }
    } else {
      console.error('[booksApi] No response (network error?)', err.message);
    }
    return Promise.reject(err);
  }
);

export const booksAPI = {
  getBooks: async (params = {}) => {
    const response = await booksApi.get('/books', { params });
    return response.data;
  },

  getBook: async (id) => {
    const response = await booksApi.get(`/books/${id}`);
    return response.data;
  },

  createBook: async (book) => {
    const response = await booksApi.post('/books', book);
    return response.data;
  },

  createBooksBulk: async (books) => {
    const response = await booksApi.post('/books/bulk', books);
    return response.data;
  },

  updateBook: async (id, book) => {
    const response = await booksApi.put(`/books/${id}`, book);
    return response.data;
  },

  updateBookState: async (id, state) => {
    // matches PUT /books/:id/state?state=...
    const response = await booksApi.put(`/books/${id}/state`, null, { params: { state } });
    return response.data;
  },

  deleteBook: async (id) => {
    const response = await booksApi.delete(`/books/${id}`);
    return response.data;
  },

  deleteDamaged: async () => {
    const response = await booksApi.delete('/books/damaged');
    return response.data;
  }
};

export default booksAPI;
