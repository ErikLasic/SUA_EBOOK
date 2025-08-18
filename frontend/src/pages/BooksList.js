import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { booksAPI } from '../services/books';
import { useAuth } from '../context/AuthContext';
import GlobalStats from '../components/GlobalStats';

const BooksList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [allBooks, setAllBooks] = useState([]);

  useEffect(() => {
    let mounted = true;
  const fetchBooks = async () => {
      try {
        const data = await booksAPI.getBooks();
        if (!mounted) return;
    const list = Array.isArray(data) ? data : (data.books || data.data || []);
    setAllBooks(list);
    setBooks(list);
      } catch (err) {
        if (!mounted) return;
        setError(err.response?.data?.message || 'Napaka pri nalaganju knjig');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchBooks();
    return () => { mounted = false; }
  }, []);

  const handleDeleteDamaged = async () => {
    if (!window.confirm('Izbrišem vse poškodovane knjige?')) return;
    setLoading(true);
    try {
      const res = await booksAPI.deleteDamaged();
      // refresh list
      const data = await booksAPI.getBooks();
      setBooks(Array.isArray(data) ? data : (data.books || data.data || []));
      alert(res?.deleted_count ? `Izbrisanih knjig: ${res.deleted_count}` : 'Operacija uspešna');
    } catch (err) {
      alert(err.response?.data?.message || 'Napaka pri brisanju poškodovanih knjig');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Nalagam knjige...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Pregled knjig</h2>
            <div className="flex items-center gap-4">
              <div className="hidden lg:block">
                <GlobalStats />
              </div>
              <div className="flex items-center gap-2">
                <Link to="/reviews/mine" className="px-3 py-2 rounded-md border bg-white/10">Moje recenzije</Link>
                <Link to="/books/new" className="px-3 py-2 rounded-md border bg-white/10">Dodaj knjigo</Link>
                {user?.role === 'admin' && (
                  <Link to="/books/bulk" className="px-3 py-2 rounded-md border bg-white/10">Dodaj več knjig</Link>
                )}
                {user?.role === 'admin' && (
                  <button onClick={handleDeleteDamaged} className="px-3 py-2 rounded-md border bg-red-100">Izbriši poškodovane</button>
                )}
              </div>
            </div>
          </div>

          <div className="mb-4 flex gap-2">
            <input placeholder="Iskanje po naslovu" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="p-2 border" />
            <button onClick={() => {
              const q = searchQuery.trim().toLowerCase();
              if (!q) { setBooks(allBooks); return; }
              setBooks(allBooks.filter(b => (b.title || '').toLowerCase().includes(q)));
            }} className="px-3 py-2 rounded-md border bg-white/10">Išči</button>
            <button onClick={() => { setSearchQuery(''); setBooks(allBooks); }} className="px-3 py-2 rounded-md border bg-gray-100">Počisti</button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {books.map((b) => (
              <div key={b._id || b.id} className="p-4 bg-white/90 rounded-md border">
                <h3 className="font-semibold">{b.title}</h3>
                <p className="text-sm text-gray-600">{b.author} — {b.publishedYear || b.publishedyear}</p>
                <p className="text-sm">Žanr: {b.genre}</p>
                <p className="text-sm">Stanje: {b.state}</p>
                <div className="mt-3 flex gap-2">
                    <Link to={`/books/${b._id || b.id}`} className="px-3 py-1 rounded-md border">Odpri</Link>
                  </div>
                
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BooksList;
