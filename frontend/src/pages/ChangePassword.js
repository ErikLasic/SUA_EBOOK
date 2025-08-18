import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

const ChangePassword = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.currentPassword || !form.newPassword) {
      setError('Izpolnite trenutno geslo in novo geslo');
      return;
    }
    setLoading(true);
    try {
      const id = authUser?.id || authUser?._id;
      if (!id) throw new Error('Ne najdem id uporabnika');
      await authAPI.changePassword(id, { currentPassword: form.currentPassword, newPassword: form.newPassword });
      setSuccess('Geslo je bilo uspešno spremenjeno');
      setTimeout(() => navigate('/profile'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Napaka pri spremembi gesla');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="w-full max-w-md mx-auto glass-card p-8">
        <h2 className="text-2xl font-bold mb-4">Spremeni geslo</h2>
        {error && <div className="alert alert-error mb-4">{error}</div>}
        {success && <div className="alert alert-success mb-4">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Trenutno geslo</label>
            <div className="relative">
              <input
                name="currentPassword"
                type={showCurrent ? 'text' : 'password'}
                value={form.currentPassword}
                onChange={handleChange}
                className="form-input pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((s) => !s)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={showCurrent ? 'Skrij geslo' : 'Pokaži geslo'}
              >
                {showCurrent ? <AiFillEyeInvisible size={18} /> : <AiFillEye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Novo geslo</label>
            <div className="relative">
              <input
                name="newPassword"
                type={showNew ? 'text' : 'password'}
                value={form.newPassword}
                onChange={handleChange}
                className="form-input pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={showNew ? 'Skrij geslo' : 'Pokaži geslo'}
              >
                {showNew ? <AiFillEyeInvisible size={18} /> : <AiFillEye size={18} />}
              </button>
            </div>
          </div>
          {/* confirm password removed - only current and new password fields are required */}
          <div className="flex justify-end">
            <button className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100" disabled={loading}>
              Spremeni geslo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
