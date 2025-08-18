import axios from 'axios';

// Default to a dev proxy path (avoids CORS in dev). Override with REACT_APP_COUNTER_URL to point directly.
const base = process.env.REACT_APP_COUNTER_URL || '/counter';

const counterApi = axios.create({ baseURL: base, headers: { 'Content-Type': 'application/json' } });

export const counterAPI = {
  getStats: async () => {
    try {
      const res = await counterApi.get('/stats');
      const d = res.data;
      // normalize possible shapes: number, { counter }, { count }, { count, lastUpdated }
      if (typeof d === 'number') return { count: d };
      if (d == null) return null;
      if (typeof d === 'object') {
        if ('count' in d && typeof d.count === 'number') return { count: d.count, lastUpdated: d.lastUpdated };
        if ('counter' in d && typeof d.counter === 'number') return { count: d.counter, lastUpdated: d.lastUpdated };
        // fallback: try to find any numeric value
        for (const k of Object.keys(d)) {
          if (typeof d[k] === 'number') return { count: d[k], lastUpdated: d.lastUpdated || null };
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }
};

export default counterAPI;
