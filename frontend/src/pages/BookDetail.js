import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { booksAPI } from '../services/books';
import { reviewsAPI } from '../services/reviews';
import { authAPI } from '../services/api';
import loansAPI from '../services/loans';
import { useAuth } from '../context/AuthContext';

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ title: '', author: '', publishedYear: '', genre: '', state: '' });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 5, reviewText: '' });
  const [sendingReview, setSendingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingReview, setEditingReview] = useState({ rating: 5, reviewText: '' });
  const [borrowing, setBorrowing] = useState(false);
  const [quickRating, setQuickRating] = useState(5);
  const [quickSending, setQuickSending] = useState(false);

  useEffect(() => {
    let mounted = true;
    booksAPI.getBook(id)
      .then((data) => { if (mounted) setBook(data); })
      .catch((err) => setError(err.response?.data?.message || 'Napaka pri nalaganju knjige'))
      .finally(() => setLoading(false));

    // load reviews & stats
    (async () => {
      try {
        const r = await reviewsAPI.getReviewsByBook(id);
        // populate reviewer names
        const enriched = await Promise.all(r.map(async (rev) => {
          try {
            const u = await authAPI.getUser(rev.userId);
            return { ...rev, userName: u.name };
          } catch { return { ...rev, userName: 'Neznan uporabnik' }; }
        }));
        setReviews(enriched);
      } catch (e) {
        // ignore if service unavailable
      }
      try {
        const s = await reviewsAPI.getBookStats(id);
        setStats(s);
      } catch {}
    })();
    // ensure quickRating reflects user's existing review when loaded
    // (we update quickRating in a separate effect below when reviews change)
    return () => { mounted = false; }
  }, [id]);

  // sync quickRating to existing user review when reviews or user change
  useEffect(() => {
    if (!user) return;
    const mine = reviews.find(r => r.userId === (user.sub || user.id || user._id));
    if (mine) setQuickRating(mine.rating || 5);
    else setQuickRating(5);
  }, [reviews, user]);

  if (loading) return <div className="p-8">Nalagam...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  const handleDelete = async () => {
    if (!window.confirm('Izbrišem to knjigo?')) return;
    try {
      await booksAPI.deleteBook(id);
      navigate('/books');
    } catch (err) {
      alert(err.response?.data?.message || 'Napaka pri brisanju knjige');
    }
  };

  const toggleState = async (newState) => {
    try {
      await booksAPI.updateBookState(id, newState);
      setBook({ ...book, state: newState });
    } catch (err) {
      alert(err.response?.data?.message || 'Napaka pri posodabljanju stanja');
    }
  };

  const startEdit = () => {
    setForm({
      title: book?.title || '',
      author: book?.author || '',
      publishedYear: book?.publishedYear || book?.publishedyear || '',
      genre: book?.genre || '',
      state: book?.state || 'unharmed'
    });
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
  };

  const saveEdit = async () => {
    const payload = {
      title: form.title,
      author: form.author,
      publishedYear: Number(form.publishedYear) || null,
      genre: form.genre,
      state: form.state,
    };
    try {
      await booksAPI.updateBook(id, payload);
      setBook({ ...book, ...payload });
      setEditMode(false);
      alert('Knjiga posodobljena');
    } catch (err) {
      alert(err.response?.data?.message || 'Napaka pri shranjevanju sprememb');
    }
  };

  const onBorrow = async () => {
    if (!user) { alert('Prijavite se, da lahko izposodite knjigo'); return; }
    // ask for an optional note
    const note = window.prompt('Zapišite razlog/namembnost izposoje (neobvezno)', '');
    if (note === null) return; // user cancelled
    // quick pre-check: ensure book exists and book-service is reachable
    try {
      await booksAPI.getBook(id);
    } catch (e) {
      console.error('Book lookup failed', e);
      alert('Knjiga ni dosegljiva ali ne obstaja: ' + (e.response?.data?.message || e.message));
      return;
    }
    const now = new Date();
    const due = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
    const payload = {
      bookId: id,
      // include a best-effort user id (loan-service may infer from token)
      userId: user?.id || user?._id || user?.sub,
      loanDate: now.toISOString(),
      dueDate: due.toISOString(),
      note: note || ''
    };
    try {
      setBorrowing(true);
      await loansAPI.create(payload);
      alert('Knjiga izposojena');
      // navigate to loans page so user can see their loan
      navigate('/loans');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Napaka pri izposoji knjige');
    } finally {
      setBorrowing(false);
    }
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto glass-card p-8">
        <h2 className="text-2xl font-bold mb-4">{book?.title}</h2>
        <p><strong>Avtor:</strong> {book?.author}</p>
        <p><strong>Letnik:</strong> {book?.publishedYear || book?.publishedyear}</p>
        <p><strong>Žanr:</strong> {book?.genre}</p>
        <p><strong>Stanje:</strong> {book?.state}</p>

        <div className="mt-4 flex gap-3">
          {!editMode && (
            <>
              {user?.role === 'admin' && (
                <>
                  <button onClick={() => toggleState('damaged')} className="px-3 py-2 rounded-md border bg-yellow-100">Označi poškodovano</button>
                  <button onClick={() => toggleState('unharmed')} className="px-3 py-2 rounded-md border bg-green-100">Označi nepoškodovano</button>
                  <button onClick={startEdit} className="px-3 py-2 rounded-md border bg-blue-100">Uredi</button>
                  <button onClick={handleDelete} className="px-3 py-2 rounded-md border bg-red-100">Izbriši knjigo</button>
                </>
              )}
              {user && (
                <button disabled={borrowing} onClick={onBorrow} className="px-3 py-2 rounded-md border bg-indigo-100">{borrowing ? 'Borrowing...' : 'Borrow'}</button>
              )}
            </>
          )}

          {editMode && (
            <div className="flex flex-col gap-2 bg-white/80 p-4 rounded">
              <input name="title" value={form.title} onChange={onChange} className="p-2 border" placeholder="Naslov" />
              <input name="author" value={form.author} onChange={onChange} className="p-2 border" placeholder="Avtor" />
              <input name="publishedYear" value={form.publishedYear} onChange={onChange} className="p-2 border" placeholder="Letnik" />
              <input name="genre" value={form.genre} onChange={onChange} className="p-2 border" placeholder="Žanr" />
              <select name="state" value={form.state} onChange={onChange} className="p-2 border">
                <option value="unharmed">unharmed</option>
                <option value="damaged">damaged</option>
              </select>
              <div className="flex gap-2">
                <button onClick={saveEdit} className="px-3 py-1 rounded-md border bg-green-100">Shrani</button>
                <button onClick={cancelEdit} className="px-3 py-1 rounded-md border bg-gray-100">Prekliči</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="max-w-3xl mx-auto mt-6 glass-card p-6">
  <h3 className="text-xl font-semibold mb-2">Recenzije</h3>
        {stats && (
          <div className="mb-3 text-sm text-gray-700">Skupaj: {stats.totalReviews} • Povprečna ocena: {stats.averageRating}</div>
        )}
        {user?.role === 'admin' && (
          <div className="mb-3">
            <button onClick={async () => {
              if (!window.confirm('Izbrišem vse recenzije za to knjigo?')) return;
              try {
                await reviewsAPI.deleteReviewsByBook(id);
                setReviews([]);
                const s = await reviewsAPI.getBookStats(id);
                setStats(s);
                alert('Vse recenzije izbrisane');
              } catch (err) { alert(err.response?.data?.message || 'Napaka pri brisanju recenzij'); }
            }} className="px-3 py-1 rounded-md border bg-red-100">Izbriši vse recenzije (admin)</button>
          </div>
        )}
        {reviews.length === 0 && <div className="text-sm text-gray-600">Ni recenzij za to knjigo.</div>}
        <div className="mt-4 mb-4 p-3 border rounded flex items-center gap-3">
          <div className="text-sm font-medium">Hitro oceni:</div>
          <select value={quickRating} onChange={(e) => setQuickRating(Number(e.target.value))} className="p-2 border">
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
          <button
            disabled={quickSending || !user}
            onClick={async () => {
              if (!user) { alert('Prijavite se, da lahko ocenjujete'); return; }
              setQuickSending(true);
              try {
                // check if user already has a review
                const mine = reviews.find(r => r.userId === (user.sub || user.id || user._id));
                if (mine) {
                  await reviewsAPI.updateReview(mine.id, { rating: quickRating, reviewText: mine.reviewText || '' });
                } else {
                  await reviewsAPI.createReview({ bookId: id, rating: quickRating, reviewText: '' });
                }
                // refresh reviews and stats
                const r = await reviewsAPI.getReviewsByBook(id);
                const enriched = await Promise.all(r.map(async (rev) => {
                  try { const u = await authAPI.getUser(rev.userId); return { ...rev, userName: u.name }; } catch { return { ...rev, userName: 'Neznan uporabnik' }; }
                }));
                setReviews(enriched);
                const s = await reviewsAPI.getBookStats(id);
                setStats(s);
                alert('Ocena shranjena');
              } catch (err) {
                alert(err.response?.data?.message || 'Napaka pri shranjevanju ocene');
              } finally { setQuickSending(false); }
            }}
            className="px-3 py-2 rounded-md border bg-indigo-100"
          >{quickSending ? 'Počasi...' : 'Oceni'}</button>
        </div>
            <div className="mt-4">
              <h4 className="font-semibold">Dodaj recenzijo</h4>
              <div className="flex items-center gap-2 mt-2">
                <select value={newReview.rating} onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })} className="p-2 border">
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
                <input value={newReview.reviewText} onChange={(e) => setNewReview({ ...newReview, reviewText: e.target.value })} placeholder="Komentar (neobvezno)" className="p-2 border flex-1" />
                <button disabled={sendingReview} onClick={async () => {
                  if (!user) { alert('Prijavite se, da lahko dodate recenzijo'); return; }
                  setSendingReview(true);
                  try {
                    await reviewsAPI.createReview({ bookId: id, rating: newReview.rating, reviewText: newReview.reviewText });
                  // send notification (best-effort)
                    // notification sending removed (service deleted); best-effort notification was previously here
                    // refresh reviews and stats
                    const r = await reviewsAPI.getReviewsByBook(id);
                    const enriched = await Promise.all(r.map(async (rev) => {
                      try { const u = await authAPI.getUser(rev.userId); return { ...rev, userName: u.name }; } catch { return { ...rev, userName: 'Neznan uporabnik' }; }
                    }));
                    setReviews(enriched);
                    const s = await reviewsAPI.getBookStats(id);
                    setStats(s);
                    setNewReview({ rating: 5, reviewText: '' });
                    alert('Recenzija dodana');
                  } catch (err) {
                    alert(err.response?.data?.message || 'Napaka pri dodajanju recenzije');
                  } finally { setSendingReview(false); }
                }} className="px-3 py-2 rounded-md border bg-blue-100">Pošlji</button>
              </div>
            </div>
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="p-3 border rounded">
              <div className="flex justify-between">
                <div><strong>{r.userName}</strong></div>
                <div className="text-sm text-gray-600">{new Date(r.updatedAt || r.createdAt).toLocaleString('sl-SI')}</div>
              </div>
              {editingReviewId === r.id ? (
                <div className="mt-2 flex gap-2 items-start">
                  <select value={editingReview.rating} onChange={(e) => setEditingReview({ ...editingReview, rating: Number(e.target.value) })} className="p-2 border">
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                  <input value={editingReview.reviewText} onChange={(e) => setEditingReview({ ...editingReview, reviewText: e.target.value })} className="p-2 border flex-1" />
                  <button onClick={async () => {
                    try {
                      await reviewsAPI.updateReview(r.id, { rating: editingReview.rating, reviewText: editingReview.reviewText });
                      const refreshed = await reviewsAPI.getReviewsByBook(id);
                      const enriched = await Promise.all(refreshed.map(async (rev) => {
                        try { const u = await authAPI.getUser(rev.userId); return { ...rev, userName: u.name }; } catch { return { ...rev, userName: 'Neznan uporabnik' }; }
                      }));
                      setReviews(enriched);
                      const s = await reviewsAPI.getBookStats(id);
                      setStats(s);
                      setEditingReviewId(null);
                      alert('Recenzija posodobljena');
                    } catch (err) { alert(err.response?.data?.message || 'Napaka pri posodabljanju'); }
                  }} className="px-3 py-1 rounded-md border bg-green-100">Shrani</button>
                  <button onClick={() => setEditingReviewId(null)} className="px-3 py-1 rounded-md border bg-gray-100">Prekliči</button>
                </div>
              ) : (
                <>
                  <div>Ocena: {r.rating}</div>
                  <div>{r.reviewText || <em>brez komentarja</em>}</div>
                  <div className="mt-2 flex gap-2">
                    {user && (user.sub === r.userId || user.id === r.userId || user._id === r.userId) && (
                      <>
                        <button onClick={() => { setEditingReviewId(r.id); setEditingReview({ rating: r.rating, reviewText: r.reviewText || '' }); }} className="px-3 py-1 rounded-md border bg-yellow-100">Uredi</button>
                        <button onClick={async () => {
                          if (!window.confirm('Izbrišem vašo recenzijo?')) return;
                          try {
                            await reviewsAPI.deleteReview(r.id);
                            const refreshed = await reviewsAPI.getReviewsByBook(id);
                            const enriched = await Promise.all(refreshed.map(async (rev) => {
                              try { const u = await authAPI.getUser(rev.userId); return { ...rev, userName: u.name }; } catch { return { ...rev, userName: 'Neznan uporabnik' }; }
                            }));
                            setReviews(enriched);
                            const s = await reviewsAPI.getBookStats(id);
                            setStats(s);
                            alert('Recenzija izbrisana');
                          } catch (err) { alert(err.response?.data?.message || 'Napaka pri brisanju'); }
                        }} className="px-3 py-1 rounded-md border bg-red-100">Izbriši</button>
                      </>
                    )}
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

export default BookDetail;
