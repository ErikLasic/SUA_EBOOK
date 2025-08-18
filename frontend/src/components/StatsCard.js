import React, { useEffect, useState } from 'react';
import { statisticsAPI } from '../services/statistics';

const StatsCard = ({ bookId }) => {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await statisticsAPI.getBookStats(bookId);
        if (!mounted) return;
        setStats(s);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; }
  }, [bookId]);

  if (!stats) return null;

  return (
    <div className="p-4 rounded-md bg-white/90 border">
      <div className="text-sm text-gray-600">Recenzije</div>
      <div className="text-xl font-semibold">{stats.totalReviews}</div>
      <div className="text-sm text-gray-500">Povprečna ocena: {stats.averageRating}</div>
    </div>
  );
};

export default StatsCard;
