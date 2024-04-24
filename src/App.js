import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignupForm from './components/SignupForm';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import PasswordResetPage from './components/PasswordResetPage';
import AdminPanel from './components/AdminPanel';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/reset-password" element={<PasswordResetPage />} />
       <Route path="/" element={<SignupForm />} />
       <Route path="/" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
