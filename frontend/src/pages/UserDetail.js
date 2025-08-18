import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { authAPI } from '../services/api';

const UserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', role: 'user', status: 'active' });

  useEffect(() => {
    authAPI.getUser(id)
      .then((data) => {
        setUser(data);
        setForm({ name: data.name || '', role: data.role || 'user', status: data.status || 'active' });
      })
      .catch((err) => setError(err.response?.data?.message || 'Napaka pri nalaganju uporabnika'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;


  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await authAPI.updateProfile(id, { name: form.name, role: form.role, status: form.status });
      alert('Shranjeno');
    } catch (err) {
      alert(err.response?.data?.message || 'Napaka pri shranjevanju');
    }
  };

  const handleDelete = async () => {
    /* eslint-disable no-alert */
    if (!window.confirm('Izbrišem uporabnika?')) return;
    /* eslint-enable no-alert */
    try {
      await authAPI.deleteUser(id);
      window.location.href = '/admin/users';
    } catch (err) {
      alert(err.response?.data?.message || 'Napaka pri brisanju');
    }
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto glass-card p-8">
        <h2 className="text-2xl font-bold mb-4">Uporabnik: {user?.name}</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Ime</label>
            <input value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} className="form-input" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Vloga</label>
            <select value={form.role} onChange={(e)=>setForm({...form, role:e.target.value})} className="form-input">
              <option value="user">Uporabnik</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Status</label>
            <select value={form.status} onChange={(e)=>setForm({...form, status:e.target.value})} className="form-input">
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </div>
          <div className="flex justify-between">
            <div>
              <button type="submit" className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100">Shrani</button>
            </div>
            <div>
              <button type="button" onClick={handleDelete} className="px-4 py-2 rounded-md border border-red-300 text-red-700 hover:bg-red-50">Izbriši</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserDetail;
