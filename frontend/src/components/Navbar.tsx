import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:opacity-90">
          📊 Student Performance
        </Link>

        <div className="hidden md:flex gap-6">
          {!user ? (
            <>
              <Link to="/login" className="hover:opacity-80">
                Login
              </Link>
              <Link to="/register" className="hover:opacity-80">
                Register
              </Link>
            </>
          ) : (
            <>
              <Link to="/" className="hover:opacity-80">
                Home
              </Link>
              {user.role === 'student' ? (
                <Link to="/student-dashboard" className="hover:opacity-80">
                  My Dashboard
                </Link>
              ) : (
                <Link to="/teacher-dashboard" className="hover:opacity-80">
                  Class Dashboard
                </Link>
              )}
              <Link to="/about" className="hover:opacity-80">
                About
              </Link>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
