import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './Auth/auth'; // Import useAuth
import './css/Register.css';
import { Link } from 'react-router-dom'; // Replace <a> with <Link>

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // Destructure login method

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await response.json();
      if (data.status) {
        login(data.user);
        navigate('/home');
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="Register-form">
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit">Login</button>
        </div>
        <div>
          <p>Don't have an account? <Link to="/register">Register</Link></p>
        </div>
        <div>
          <p>Forgot your password? <Link to="/forgot-password">Reset Password</Link></p>
        </div>
      </form>
    </div>
  );
};

export default Login;