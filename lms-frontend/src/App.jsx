import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Catalog from './pages/Catalog';
import CoursePlayer from './pages/player/CoursePlayer';
import AdminDashboard from './pages/admin/AdminDashboard';
import Dashboard from './pages/Dashboard';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      {user && (
        <nav className="navbar">
          <Link to={user.role === 'ADMIN' ? '/admin' : '/catalog'} className="nav-brand">EduPlatform</Link>
          <div className="nav-links">
            {user.role === 'STUDENT' && (
              <>
                <Link to="/catalog">Каталог</Link>
                <Link to="/dashboard">Мое обучение</Link>
              </>
            )}
            <span style={{marginLeft: '1.5rem', color: '#64748b'}}>{user.fullName}</span>
            <button onClick={handleLogout} className="secondary" style={{width: 'auto', padding: '0.5rem 1rem', marginLeft: '1.5rem'}}>Выйти</button>
          </div>
        </nav>
      )}

      <Routes>
        <Route path="/" element={!user ? <Navigate to="/login" /> : <Navigate to="/catalog" />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/catalog" element={user ? <Catalog user={user} /> : <Navigate to="/login" />} />
        
        {}
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
         <Route path="/admin" element={user?.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/" />} />
        <Route path="/course/:courseId" element={user ? <CoursePlayer user={user} /> : <Navigate to="/login" />} />
       
      </Routes>
    </BrowserRouter>
  );
}

export default App;