import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { FiAlertCircle, FiLogIn, FiMail, FiLock } from 'react-icons/fi';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);
      login(response.token, response.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Napaka pri prijavi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center px-4 pt-20 pb-8">
      <div className="w-full max-w-md mx-auto">
        <div className="glass-card p-8 w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiLogIn className="text-2xl text-white" />
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-2">Dobrodošli nazaj!</h2>
            <p className="text-gray-600">Prijavite se v svoj račun</p>
          </div>
          
          {error && (
            <div className="alert alert-error mb-6">
              <div className="flex items-center">
                <FiAlertCircle className="text-lg mr-2 text-red-600" />
                {error}
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                <FiMail className="inline mr-2" />
                E-pošta
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="vasa.eposta@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                <FiLock className="inline mr-2" />
                Geslo
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full px-4 py-3 rounded-md text-base font-semibold border border-gray-300 text-gray-700 bg-transparent hover:bg-gray-100 transition-colors mt-8"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Prijavljam...
                </div>
              ) : (
                "Prijava"
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Še nimate računa? {' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                Registrirajte se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
