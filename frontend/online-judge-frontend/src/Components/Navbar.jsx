import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import './css/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="brand">
          <img src="/logo.png" alt="Logo" className="brand-logo" />
          <span className="brand-text">CodeJudge</span>
        </Link>

        <div className="nav-links">
          {user ? (
            <>
              <Link to="/problems" className="nav-link">Problems</Link>
              <button onClick={logout} className="nav-link">Logout</button>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </div>
          )}
        </div>

        <button className="mobile-menu-btn">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;