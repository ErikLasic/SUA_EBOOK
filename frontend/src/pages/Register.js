import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { FiAlertCircle, FiCheckCircle, FiUserPlus, FiUser, FiMail, FiLock, FiSettings } from 'react-icons/fi';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
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
    setSuccess('');

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Gesli se ne ujemata');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Geslo mora biti dolgo vsaj 6 znakov');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registrationData } = formData;
      await authAPI.register(registrationData);
      setSuccess('Registracija uspešna! Preusmerjam na prijavo...');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Napaka pri registraciji');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center px-4 pt-20 pb-8">
      <div className="w-full max-w-md mx-auto">
        <div className="glass-card p-8 w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiUserPlus className="text-2xl text-white" />
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-2">Pridružite se nam!</h2>
            <p className="text-gray-600">Ustvarite nov račun</p>
          </div>
          
          {error && (
            <div className="alert alert-error mb-6">
              <div className="flex items-center">
                <FiAlertCircle className="text-lg mr-2 text-red-600" />
                {error}
              </div>
            </div>
          )}
          
          {success && (
            <div className="alert alert-success mb-6">
              <div className="flex items-center">
                <FiCheckCircle className="text-lg mr-2 text-green-600" />
                {success}
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-3">
                <FiUser className="inline mr-2" />
                Polno ime
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Vaše polno ime"
              />
            </div>
            
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
                placeholder="Vsaj 6 znakov"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-3">
                <FiLock className="inline mr-2" />
                Potrdite geslo
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Ponovite geslo"
              />
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-3">
                <FiSettings className="inline mr-2" />
                Vloga
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-input"
              >
                <option value="user">Uporabnik</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            
            <button 
              type="submit" 
              className="w-full px-4 py-3 rounded-md text-base font-semibold border border-gray-300 text-gray-700 bg-transparent hover:bg-gray-100 transition-colors mt-8"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Registriram...
                </div>
              ) : (
                "Registracija"
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Že imate račun? {' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                Prijavite se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
