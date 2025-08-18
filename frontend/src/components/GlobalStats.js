import React, { useEffect, useState } from 'react';
import { statisticsAPI } from '../services/statistics';

const GlobalStats = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await statisticsAPI.getGlobal().catch(() => null);
        if (!mounted) return;
        setStats(s);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!stats) return null;

  return (
    <div className="p-3 rounded-md bg-white/90 border text-sm">
      <div className="text-xs text-gray-500">Statistika</div>
      <div className="font-semibold text-lg">{stats.totalReviews}</div>
      <div className="text-xs text-gray-500">Skupaj recenzij</div>
      <div className="mt-1 text-sm">Povprečna ocena: {stats.averageRating}</div>
    </div>
  );
};

export default GlobalStats;
