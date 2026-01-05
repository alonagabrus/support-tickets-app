import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <Link to="/tickets" className="header-logo">
            Support Tickets App
          </Link>
          <div className="flex items-center gap-4">
            {username && <span className="text-sm text-white">Welcome, {username}</span>}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="text-white hover:text-gray-200 text-sm font-medium transition-colors underline"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="text-white hover:text-gray-200 text-sm font-medium transition-colors underline"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        <div className="footer-content">
          <p className="copyright-text">© Alona G.</p>
        </div>
      </footer>
    </div>
  );
};
