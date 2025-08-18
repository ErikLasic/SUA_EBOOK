import React, { useState } from 'react';
import { booksAPI } from '../services/books';
import { useNavigate } from 'react-router-dom';

const empty = () => ({ title: '', author: '', publishedYear: '', genre: '', state: 'unharmed' });

const BulkBooks = () => {
  const [rows, setRows] = useState([empty()]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (i, key, value) => setRows(rows.map((r, idx) => idx === i ? { ...r, [key]: value } : r));
  const addRow = () => setRows([...rows, empty()]);
  const removeRow = (i) => setRows(rows.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = rows.map(r => ({ ...r, publishedYear: Number(r.publishedYear) || null }));
      await booksAPI.createBooksBulk(payload);
      navigate('/books');
    } catch (err) {
      alert(err.response?.data?.message || 'Napaka pri bulk dodajanju');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto glass-card p-8">
        <h2 className="text-2xl font-bold mb-4">Dodaj več knjig</h2>
        <form onSubmit={submit} className="flex flex-col gap-4">
          {rows.map((r, i) => (
            <div key={i} className="p-3 border rounded grid grid-cols-6 gap-2 items-center">
              <input className="col-span-2 p-2 border" value={r.title} onChange={(e) => update(i, 'title', e.target.value)} placeholder="Naslov" />
              <input className="col-span-1 p-2 border" value={r.author} onChange={(e) => update(i, 'author', e.target.value)} placeholder="Avtor" />
              <input className="col-span-1 p-2 border" value={r.publishedYear} onChange={(e) => update(i, 'publishedYear', e.target.value)} placeholder="Letnik" />
              <input className="col-span-1 p-2 border" value={r.genre} onChange={(e) => update(i, 'genre', e.target.value)} placeholder="Žanr" />
              <select className="col-span-1 p-2 border" value={r.state} onChange={(e) => update(i, 'state', e.target.value)}>
                <option value="unharmed">unharmed</option>
                <option value="damaged">damaged</option>
              </select>
              <div className="col-span-6 flex gap-2 justify-end">
                <button type="button" onClick={() => removeRow(i)} className="px-3 py-1 border rounded">Odstrani</button>
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <button type="button" onClick={addRow} className="px-4 py-2 border rounded">+ Dodaj vrstico</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Shrani vse</button>
            <button type="button" onClick={() => navigate('/books')} className="px-4 py-2 border rounded">Prekliči</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkBooks;
