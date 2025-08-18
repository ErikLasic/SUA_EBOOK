import axios from 'axios';

// Default to the deployed Render URL if available; can be overridden with REACT_APP_STATS_URL
const base =  'https://statistics-service-qjzt.onrender.com';

const statsApi = axios.create({
  baseURL: base,
  headers: { 'Content-Type': 'application/json' }
});

export const statisticsAPI = {
  getBookStats: async (bookId) => {
    const res = await statsApi.get(`/api/stats/recent?bookId=${bookId}`);
    // repo statistics-service doesn't provide single-book summary endpoint — derive from recent as fallback
    // return shape: { totalReviews, averageRating }
    const recent = res.data || { recentReviews: [] };
    const total = recent.recentReviews ? recent.recentReviews.length : 0;
    const avg = total > 0 ? (recent.recentReviews.reduce((s,r) => s + (r.rating||0), 0) / total) : 0;
    return { totalReviews: total, averageRating: Math.round(avg * 100) / 100 };
  },
  getGlobal: async () => {
    const res = await statsApi.get('/api/stats/overview');
    return res.data;
  },
  // optional: let frontend request a recompute/update
  updateBookStats: async (bookId, payload) => {
    const res = await statsApi.post(`/stats/book/${bookId}`, payload);
    return res.data;
  }
};

export default statisticsAPI;
