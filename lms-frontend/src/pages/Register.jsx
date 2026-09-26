import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Register() {
    const [formData, setFormData] = useState({ username: '', password: '', fullName: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', formData);
            alert('Регистрация успешна! Теперь войдите.');
            navigate('/login');
        } catch (err) {
            alert('Ошибка регистрации. Возможно, логин занят.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2 style={{textAlign: 'center', marginBottom: '2rem'}}>Регистрация</h2>
                <form onSubmit={handleSubmit}>
                    <label>ФИО</label>
                    <input onChange={e => setFormData({...formData, fullName: e.target.value})} required />
                    
                    <label>Логин</label>
                    <input onChange={e => setFormData({...formData, username: e.target.value})} required />
                    
                    <label>Пароль</label>
                    <input type="password" onChange={e => setFormData({...formData, password: e.target.value})} required />
                    
                    <button type="submit">Создать аккаунт</button>
                    <div style={{textAlign: 'center', marginTop: '1rem'}}>
                        <Link to="/login" style={{color: '#2563eb', textDecoration: 'none'}}>Уже есть аккаунт? Войти</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}