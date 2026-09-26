import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Login({ setUser }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', { username, password });
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            navigate(res.data.role === 'ADMIN' ? '/admin' : '/catalog');
        } catch (err) {
            alert('Неверный логин или пароль');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2 style={{textAlign: 'center', marginBottom: '2rem'}}>Вход в LMS</h2>
                <form onSubmit={handleLogin}>
                    <label>Логин</label>
                    <input value={username} onChange={e => setUsername(e.target.value)} required />
                    
                    <label>Пароль</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    
                    <button type="submit">Войти</button>
                    <div style={{textAlign: 'center', marginTop: '1rem'}}>
                        <Link to="/register" style={{color: '#2563eb', textDecoration: 'none'}}>Нет аккаунта? Зарегистрируйтесь</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}