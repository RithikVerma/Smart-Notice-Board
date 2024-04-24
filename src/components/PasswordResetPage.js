import React, { useState } from 'react';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from './firebase-config'; // Make sure this path is correct
import { Link } from 'react-router-dom';
import './PasswordResetPage.css'; // Assuming you have some CSS for styling

const PasswordResetPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Check your email for further instructions.');
    } catch (error) {
      setError('Failed to send password reset email.');
      console.error('Error sending password reset email:', error);
    }
  };

  return (
    <div className="password-reset-container">
      <h2>Reset Your Password</h2>
      {message && <div className="message">{message}</div>}
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleResetPassword} className="password-reset-form">
        <div>
          <label htmlFor="email">Email:</label>
          <input 
            id="email"
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" className="reset-password-btn">Reset Password</button>
      </form>
      <Link to="/login">Back to login</Link>
    </div>
  );
};

export default PasswordResetPage;
