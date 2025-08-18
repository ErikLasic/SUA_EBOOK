import axios from 'axios';

const recommendationsApi = axios.create({
	baseURL: 'http://127.0.0.1:8001',
	headers: { 'Content-Type': 'application/json' },
});

const recommendationsAPI = {
	// GET /recommendations/top
	getTop: async (params = {}) => {
		const token = localStorage.getItem('token');
		const headers = token ? { Authorization: `Bearer ${token}` } : {};
		const res = await recommendationsApi.get('/recommendations/top', { params, headers });
		return res.data;
	},
	// GET /recommendations/{userId}
	getForUser: async (userId, params = {}) => {
		if (!userId) throw new Error('userId required');
		const token = localStorage.getItem('token');
		const headers = token ? { Authorization: `Bearer ${token}` } : {};
		const res = await recommendationsApi.get(`/recommendations/${userId}`, { params, headers });
		return res.data;
	},
};

export default recommendationsAPI;
