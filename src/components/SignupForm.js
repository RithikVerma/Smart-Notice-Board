import React, { useState } from 'react';
import { auth, database } from './firebase-config'; // Import Firebase Realtime Database instance
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import './SignupForm.css';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi'; 
import { ref, set } from 'firebase/database';


const SignupForm = () => {
  const [userDetails, setUserDetails] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'student',
  });

  const [passwordStrength, setPasswordStrength] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUserDetails({ ...userDetails, [e.target.name]: e.target.value });

    if (e.target.name === 'password') {
      const strength = getPasswordStrength(e.target.value);
      setPasswordStrength(strength);
    }
  };

  const handlePhoneChange = (phoneNumber) => {
    setUserDetails({ ...userDetails, phoneNumber });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getPasswordStrength = (password) => {
    let strengths = 0;
    if (password.length >= 8) strengths++;
    if (/[a-z]/.test(password)) strengths++;
    if (/[A-Z]/.test(password)) strengths++;
    if (/[0-9]/.test(password)) strengths++;
    if (/[^A-Za-z0-9]/.test(password)) strengths++;

    switch (strengths) {
      case 0:
      case 1:
      case 2:
        return 'Weak';
      case 3:
      case 4:
        return 'Average';
      case 5:
        return 'Strong';
      default:
        return 'Weak';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if all fields are filled
    for (const key in userDetails) {
      if (userDetails[key] === '') {
        alert('Please fill in all fields.');
        return; // Stop submission if any field is empty
      }
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userDetails.email,
        userDetails.password
      );

      // Set the user's full name as the displayName
      await updateProfile(auth.currentUser, { displayName: userDetails.fullName });

      // Send verification email
      await sendEmailVerification(auth.currentUser);

      // Store user details in Firebase Realtime Database
      await set(ref(database, 'users/' + userCredential.user.uid), {
        fullName: userDetails.fullName,
        email: userDetails.email,
        phoneNumber: userDetails.phoneNumber,
        role: userDetails.role,
      });

      console.log('User registered with:', userCredential.user);
      alert('User registered successfully. Please verify your email and log in.');
      navigate('/login');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        alert('User already registered. Please log in.');
        navigate('/login');
      } else {
        console.error('Error signing up:', error.message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Sign Up as a {userDetails.role.toUpperCase()}</h2>
      <label>
        Full Name:
        <input type="text" name="fullName" value={userDetails.fullName} onChange={handleChange} required />
      </label>
      <label>
        Email:
        <input type="email" name="email" value={userDetails.email} onChange={handleChange} required />
      </label>
      <label>
        Phone Number:
        <PhoneInput
          international
          defaultCountry="US"
          value={userDetails.phoneNumber}
          onChange={handlePhoneChange}
          required
        />
      </label>
      <label>
        Password:
        <div className="password-container">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={userDetails.password}
            onChange={handleChange}
            required
          />
          <button type="button" onClick={togglePasswordVisibility} className="toggle-password">
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
        <span>Password Strength: {passwordStrength}</span>
      </label>
      <label>
        Role:
        <select name="role" value={userDetails.role} onChange={handleChange}>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
        </select>
      </label>
      <button type="submit" className="signup-btn">Sign Up</button>
      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </form>
  );
};

export default SignupForm;
