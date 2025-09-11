'use client';
import './page.css';
import { useState } from 'react';

export default function Home() {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, url }),
      });
      
      if (response.ok) {
        alert('Ссылка добавлена в базу данных!');
        setTitle('');
        setUrl('');
      } else {
        alert('Ошибка при добавлении ссылки');
      }
    } catch (error) {
      alert('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Links Manager</h1>
      
      <form className="form-section" onSubmit={handleSubmit}>
        <h2>Добавить новую ссылку</h2>
        
        <div className="form-group">
          <label className="label">Название ссылки:</label>
          <input 
            type="text" 
            className="input"
            placeholder="Введите название..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label className="label">URL ссылки:</label>
          <input 
            type="url" 
            className="input"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" className="button" disabled={loading}>
          {loading ? 'Отправляется...' : 'Отправить в БД'}
        </button>
      </form>
    </div>
  );
}