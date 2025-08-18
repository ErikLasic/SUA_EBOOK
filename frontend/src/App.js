import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import ChangePassword from './pages/ChangePassword';
import UsersList from './pages/UsersList';
import UserDetail from './pages/UserDetail';
import BooksList from './pages/BooksList';
import BookDetail from './pages/BookDetail';
import NewBook from './pages/NewBook';
import BulkBooks from './pages/BulkBooks';
import ReviewsMine from './pages/ReviewsMine';
import Loans from './pages/Loans';
import Recommendations from './pages/Recommendations';
import GraphQLPage from './pages/GraphQLPage';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route component (redirect if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

// RoleProtected wrapper component for admin-only routes
function RoleProtected({ children }) {
  const { user } = useAuth();
  if (!user) return <div>Loading...</div>;
  return user.role === 'admin' ? children : <Navigate to="/" />;
}

function AppContent() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={
          // show login/register when not authenticated, otherwise dashboard
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        {/* Admin-only routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <RoleProtected>
                <UsersList />
              </RoleProtected>
            </ProtectedRoute>
          }
        />

        <Route
          path="/books"
          element={
            <ProtectedRoute>
              <BooksList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/books/new"
          element={
            <ProtectedRoute>
              <NewBook />
            </ProtectedRoute>
          }
        />

        <Route
          path="/books/bulk"
          element={
            <ProtectedRoute>
              <BulkBooks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/books/:id"
          element={
            <ProtectedRoute>
              <BookDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reviews/mine"
          element={
            <ProtectedRoute>
              <ReviewsMine />
            </ProtectedRoute>
          }
        />

        <Route
          path="/loans"
          element={
            <ProtectedRoute>
              <Loans />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <Recommendations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/graphql"
          element={
            <ProtectedRoute>
              <GraphQLPage />
            </ProtectedRoute>
          }
        />

        

        <Route
          path="/admin/users/:id"
          element={
            <ProtectedRoute>
              <RoleProtected>
                <UserDetail />
              </RoleProtected>
            </ProtectedRoute>
          }
        />

        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
