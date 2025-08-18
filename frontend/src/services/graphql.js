import axios from 'axios';

const graphqlApi = axios.create({
  baseURL: 'http://127.0.0.1:4001',
  headers: { 'Content-Type': 'application/json' },
});

const graphqlAPI = {
  // GET /health
  health: async () => {
    const res = await graphqlApi.get('/health');
    return res.data;
  },

  // POST /graphql
  query: async (query, variables = {}) => {
    const payload = { query };
    if (Object.keys(variables).length > 0) {
      payload.variables = variables;
    }
    const res = await graphqlApi.post('/graphql', payload);
    return res.data;
  },
};

export default graphqlAPI;
