import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiBookOpen, FiLogOut, FiStar } from 'react-icons/fi';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
  <header className={`site-header glass-card sticky top-4 z-50 mx-4 my-6 p-4 border-b border-white/10 shadow-md bg-white/5 backdrop-blur-md ${compact ? 'compact' : ''}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Logo */}
        <Link to="/" className="logo flex items-center gap-3 hover:scale-105 transition-all duration-200">
          <div className="relative flex items-center">
            <FiBookOpen className="text-3xl md:text-4xl text-blue-600" />
            <FiStar className="absolute -top-1 -right-1 text-sm text-purple-500 animate-pulse" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SUA
            </div>
            <div className="text-xs text-gray-400">E-Book System</div>
          </div>
        </Link>

        {/* Spacer to center nav on large screens */}
        <div className="flex-1 hidden lg:flex justify-center"></div>

        {/* Actions */}
        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col text-right mr-3">
                <span className="text-sm text-gray-500">Pozdravljen,</span>
                <span className="font-semibold gradient-text">{user.name}</span>
              </div>
              {/* Profile and recommendations links */}
              <Link to="/profile" className="hidden md:inline-flex px-3 py-2 rounded-md text-sm font-semibold border border-transparent text-gray-700 bg-white/10 hover:bg-white/20 transition-colors">
                Profil
              </Link>
              <Link to="/recommendations" className="hidden md:inline-flex px-3 py-2 rounded-md text-sm font-semibold border border-transparent text-gray-700 bg-white/10 hover:bg-white/20 transition-colors">
                Priporočila
              </Link>
              <Link to="/graphql" className="hidden md:inline-flex px-3 py-2 rounded-md text-sm font-semibold border border-transparent text-gray-700 bg-white/10 hover:bg-white/20 transition-colors">
                GraphQL
              </Link>
              {/* admin users link removed per request */}
              <button onClick={handleLogout} className="inline-flex items-center px-3 py-2 rounded-md border bg-white/10 text-sm font-semibold">
                <FiLogOut className="mr-2 text-lg" /> Odjava
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 rounded-md text-sm font-semibold border border-gray-300 text-gray-700 bg-transparent hover:bg-gray-100 transition-colors"
              >
                Prijava
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-md text-sm font-semibold border border-gray-300 text-gray-700 bg-transparent hover:bg-gray-100 transition-colors"
              >
                Registracija
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
