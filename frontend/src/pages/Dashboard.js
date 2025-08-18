import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiBook, FiCreditCard, FiBookOpen, FiBarChart2, FiCheckCircle } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="card text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Nalagam...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="card">

        
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <FiBarChart2 /> Profil uporabnika
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Ime:</span>
                <p className="text-lg font-semibold text-gray-800">{user.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">E-pošta:</span>
                <p className="text-lg text-gray-700">{user.email}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Vloga:</span>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  user.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role === 'admin' ? 'Administrator' : 'Uporabnik'}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 items-center">
                  <FiCheckCircle className="mr-2" /> {user.status}
                </span>
              </div>
              {user.lastLoginAt && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Zadnja prijava:</span>
                  <p className="text-sm text-gray-600">
                    {new Date(user.lastLoginAt).toLocaleString('sl-SI')}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <a href="/profile" className="inline-block px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100">Uredi profil</a>
          </div>
        </div>
        
          <div className="text-center">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">Funkcionalnosti sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link to="/books" className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-xl hover:scale-105 transition-transform cursor-pointer block">
              <div className="text-3xl mb-3"><FiBook /></div>
              <h4 className="font-semibold text-gray-800 mb-2">Pregled knjig</h4>
              <p className="text-sm text-gray-600">Brskanje po knjižnici</p>
            </Link>

            <Link to="/reviews/mine" className="bg-gradient-to-br from-pink-100 to-pink-200 p-6 rounded-xl hover:scale-105 transition-transform cursor-pointer block">
              <div className="text-3xl mb-3"><FiBookOpen /></div>
              <h4 className="font-semibold text-gray-800 mb-2">Moje recenzije</h4>
              <p className="text-sm text-gray-600">Pregledi in ocene</p>
            </Link>

            <Link to="/loans" className="bg-gradient-to-br from-purple-100 to-purple-200 p-6 rounded-xl hover:scale-105 transition-transform cursor-pointer block">
              <div className="text-3xl mb-3"><FiCreditCard /></div>
              <h4 className="font-semibold text-gray-800 mb-2">Izposoja knjig</h4>
              <p className="text-sm text-gray-600">Sistem rezervacij</p>
            </Link>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
