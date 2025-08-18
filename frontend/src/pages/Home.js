import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiStar, FiBook, FiCreditCard, FiBarChart2 } from 'react-icons/fi';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="card text-center mb-8">

        {isAuthenticated && (
          <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-6 mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
              Pozdravljeni, <span className="gradient-text">{user.name}</span>!
            </h3>
            <p className="text-gray-600 mb-4">
              Pripravljeni za raziskovanje? Vaš dashboard vas čaka.
            </p>
            <Link to="/dashboard" className="btn btn-primary text-lg flex items-center gap-2">
              <FiBarChart2 /> Odpri Dashboard
            </Link>
          </div>
        )}
      </div>
      
      {/* Features Grid */}
      <div className="card">
        <h3 className="text-3xl font-bold text-center gradient-text mb-8">
          Funkcionalnosti sistema
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link to="/books" className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-shadow block">
            <div className="text-4xl mb-4"><FiBook /></div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">Knjižnica</h4>
            <p className="text-gray-600">Pregled, iskanje in upravljanje e-knjig z naprednimi filtri</p>
          </Link>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4"><FiCreditCard /></div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">Izposoja</h4>
            <p className="text-gray-600">Pametno sledenje izposojam z avtomatskimi opomini</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4"><FiStar /></div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">Ocenjevanje</h4>
            <p className="text-gray-600">Reviews, ocene in komentarji z moderacijo</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4"><FiBarChart2 /></div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">Statistike</h4>
            <p className="text-gray-600">Real-time analitika s 3D vizualizacijami</p>
          </div>
        </div>
        
        {/* Technical stack removed per request */}
      </div>
      
      </div>
    </div>
  );
};

export default Home;
