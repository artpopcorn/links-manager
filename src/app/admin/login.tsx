'use client';

import { useState } from 'react';
import './admin.css';

interface LoginProps {
  onLogin: (success: boolean) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [credentials, setCredentials] = useState({
    login: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.login,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLogin(true);
      } else {
        setError(data.error || 'Ошибка авторизации');
        onLogin(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Ошибка подключения к серверу');
      onLogin(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-header">
          <h1>Вход в админку</h1>
          <p>Введите логин и пароль для доступа</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Логин"
              value={credentials.login}
              onChange={(e) => setCredentials({...credentials, login: e.target.value})}
              className="login-input"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Пароль"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              className="login-input"
              required
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="login-info">
          <small>По умолчанию: admin / admin123</small>
        </div>
      </div>
    </div>
  );
}
