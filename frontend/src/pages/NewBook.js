import React, { useState } from 'react';
import { booksAPI } from '../services/books';
import { useNavigate } from 'react-router-dom';

const NewBook = () => {
  const [form, setForm] = useState({ title: '', author: '', publishedYear: '', genre: '', state: 'unharmed' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, publishedYear: Number(form.publishedYear) || null };
      await booksAPI.createBook(payload);
      navigate('/books');
    } catch (err) {
      alert(err.response?.data?.message || 'Napaka pri ustvarjanju knjige');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto glass-card p-8">
        <h2 className="text-2xl font-bold mb-4">Dodaj novo knjigo</h2>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input name="title" value={form.title} onChange={onChange} placeholder="Naslov" className="p-2 border" />
          <input name="author" value={form.author} onChange={onChange} placeholder="Avtor" className="p-2 border" />
          <input name="publishedYear" value={form.publishedYear} onChange={onChange} placeholder="Letnik" className="p-2 border" />
          <input name="genre" value={form.genre} onChange={onChange} placeholder="Žanr" className="p-2 border" />
          <select name="state" value={form.state} onChange={onChange} className="p-2 border">
            <option value="unharmed">unharmed</option>
            <option value="damaged">damaged</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Shrani</button>
            <button type="button" onClick={() => navigate('/books')} className="px-4 py-2 border rounded">Prekliči</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewBook;
