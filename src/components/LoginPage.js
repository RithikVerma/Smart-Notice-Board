import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, googleProvider } from './firebase-config';
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import googleLogo from '../components/Image/google_icon.png';
import './LoginPage.css'

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(''); // State to store login error messages
  const navigate = useNavigate(); // Initialize useNavigate

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Signed in with Google:", result.user);
      navigate('/home'); // Redirect to home page after successful sign-in
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const handleEmailPasswordSignIn = async (e) => {
    e.preventDefault(); // Prevent the form from reloading the page
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if the email has been verified
      if (userCredential.user.emailVerified) {
        console.log("Signed in with email and password:", userCredential.user);
        navigate('/home'); // Redirect to home page after successful sign-in
      } else {
        // User's email is not verified, show an error message
        setLoginError('Please verify your email before signing in.');
      }
    } catch (error) {
      console.error("Error signing in with email and password:", error);
      setLoginError("Failed to sign in. Please check your email and password.");
    }
  };
  
  return (
    <div className="login-container">
      <h2>Login Page</h2>
      
      {loginError && <div className="login-error">{loginError}</div>}
      
      <form onSubmit={handleEmailPasswordSignIn} className="email-password-signin-form">
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
        <div>
          <label htmlFor="password">Password:</label>
          <input 
            id="password"
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" className="email-signin-btn">Sign in</button>
        <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
        <div className="forgot-password-link">
          <Link to="/reset-password">Forgot Password?</Link>
        </div>
      </form>
      
      <button onClick={handleGoogleSignIn} className="google-signin-btn">
        <img src={googleLogo} alt="" />
        Sign in with Google
      </button>
    </div>
  );
};

export default LoginPage;
