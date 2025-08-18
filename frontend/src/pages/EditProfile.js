import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const EditProfile = () => {
  const [form, setForm] = useState({ name: '', role: 'user', status: 'active' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user: authUser, updateUser, login } = useAuth();

  useEffect(() => {
    let mounted = true;
    const id = authUser?.id || authUser?._id;
    if (!id) {
      setError('Neprijavljen uporabnik');
      setLoading(false);
      return () => { mounted = false; };
    }
    authAPI.getUser(id)
      .then((data) => { if (mounted) setForm({ name: data.name, role: data.role || 'user', status: data.status || 'active' }); })
      .catch((err) => setError(err.response?.data?.message || 'Napaka pri nalaganju'))
      .finally(() => setLoading(false));
    return () => { mounted = false; }
  }, [authUser]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });


  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const id = authUser?.id || authUser?._id;
      if (!id) throw new Error('Ne najdem id uporabnika');
      const res = await authAPI.updateProfile(id, form);
      // If backend returns a fresh token (after role change), use it to re-login
      if (res?.token) {
        const userFromRes = res.user || (await authAPI.getUser(id));
        login(res.token, userFromRes);
      } else {
        // Otherwise refresh the user object in context (note: token may still reflect old role)
        const refreshed = await authAPI.getUser(id);
        updateUser(refreshed);
      }
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Napaka pri shranjevanju');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="w-full max-w-md mx-auto glass-card p-8">
        <h2 className="text-2xl font-bold mb-4">Uredi profil</h2>
        {error && <div className="alert alert-error mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Ime</label>
            <input name="name" value={form.name} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Vloga</label>
            <select name="role" value={form.role} onChange={handleChange} className="form-input">
              <option value="user">Uporabnik</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="form-input">
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100" disabled={saving}>
              Shrani
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
