import React, { useEffect, useState } from 'react';
import { reviewsAPI } from '../services/reviews';
import { useAuth } from '../context/AuthContext';
import { booksAPI } from '../services/books';

const ReviewsMine = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editing, setEditing] = useState({ rating: 5, reviewText: '' });

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const load = async () => {
      try {
        const userId = user.sub || user.id || user._id || user.userId || '68a07ca8ced6e431d7903fb0';
        const data = await reviewsAPI.getReviewsByUser(userId);
        if (!mounted) return;
        // enrich reviews with book title
        const enriched = await Promise.all(data.map(async (r) => {
          try {
            const b = await booksAPI.getBook(r.bookId);
            return { ...r, bookTitle: b.title };
          } catch { return { ...r, bookTitle: 'Neznana knjiga' }; }
        }));
        setReviews(enriched);
      } catch (e) {
        setError(e.response?.data?.message || 'Napaka pri nalaganju recenzij');
      } finally { setLoading(false); }
    };
    load();
    return () => { mounted = false; }
  }, [user]);

  if (loading) return <div className="p-8">Nalagam recenzije...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto glass-card p-6">
        <h2 className="text-2xl font-semibold mb-4">Moje recenzije</h2>
        <div className="space-y-3">
          {reviews.length === 0 && <div>Še nimate recenzij.</div>}
          {reviews.map(r => (
            <div key={r.id} className="p-3 border rounded">
              <div className="flex justify-between">
                <div><strong>{r.bookTitle}</strong></div>
                <div className="text-sm text-gray-600">{new Date(r.updatedAt || r.createdAt).toLocaleString('sl-SI')}</div>
              </div>
              {editingId === r.id ? (
                <div className="mt-2 flex gap-2 items-start">
                  <select value={editing.rating} onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })} className="p-2 border">
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                  <input value={editing.reviewText} onChange={(e) => setEditing({ ...editing, reviewText: e.target.value })} className="p-2 border flex-1" />
                  <button onClick={async () => {
                    try {
                      await reviewsAPI.updateReview(r.id, { rating: editing.rating, reviewText: editing.reviewText });
                      const data = await reviewsAPI.getReviewsByUser(user.sub || user.id || user._id || user.userId);
                      const enriched = await Promise.all(data.map(async (rr) => { try { const b = await booksAPI.getBook(rr.bookId); return { ...rr, bookTitle: b.title }; } catch { return { ...rr, bookTitle: 'Neznana knjiga' }; } }));
                      setReviews(enriched);
                      setEditingId(null);
                      alert('Recenzija posodobljena');
                    } catch (err) { alert(err.response?.data?.message || 'Napaka pri posodabljanju'); }
                  }} className="px-3 py-1 rounded-md border bg-green-100">Shrani</button>
                  <button onClick={() => setEditingId(null)} className="px-3 py-1 rounded-md border bg-gray-100">Prekliči</button>
                </div>
              ) : (
                <>
                  <div>Ocena: {r.rating}</div>
                  <div>{r.reviewText || <em>brez komentarja</em>}</div>
                  <div className="mt-2">
                    <button onClick={() => { setEditingId(r.id); setEditing({ rating: r.rating, reviewText: r.reviewText || '' }); }} className="px-3 py-1 rounded-md border bg-yellow-100">Uredi</button>
                    <button onClick={async () => {
                      if (!window.confirm('Izbrišem to recenzijo?')) return;
                      try {
                        await reviewsAPI.deleteReview(r.id);
                        const data = await reviewsAPI.getReviewsByUser(user.sub || user.id || user._id || user.userId);
                        const enriched = await Promise.all(data.map(async (rr) => { try { const b = await booksAPI.getBook(rr.bookId); return { ...rr, bookTitle: b.title }; } catch { return { ...rr, bookTitle: 'Neznana knjiga' }; } }));
                        setReviews(enriched);
                        alert('Recenzija izbrisana');
                      } catch (err) { alert(err.response?.data?.message || 'Napaka pri brisanju'); }
                    }} className="px-3 py-1 rounded-md border bg-red-100 ml-2">Izbriši</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewsMine;
