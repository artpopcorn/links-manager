'use client';
import './page.css';
import { useState } from 'react';

interface Link {
  id: string;
  title: string;
  url: string;
  createdAt: string;
}

export default function Home() {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [links, setLinks] = useState<Link[]>([]);

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

  const handleGetLinks = async () => {
    setLoadingLinks(true);
    
    try {
      const response = await fetch('/api/links');
      const data = await response.json();
      
      if (response.ok) {
        setLinks(data.links);
      } else {
        alert('Ошибка при получении ссылок');
      }
    } catch (error) {
      alert('Ошибка соединения');
    } finally {
      setLoadingLinks(false);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Links Manager</h1>
      
      <form className="form-section" onSubmit={handleSubmit}>
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

        <div className="btns">
          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Отправляется...' : 'Отправить в БД'}
          </button>

          <button 
            type="button" 
            className="button btn2" 
            disabled={loadingLinks}
            onClick={handleGetLinks}
          >
            {loadingLinks ? 'Получаем...' : 'Получить из БД'}
          </button>
        </div>
      </form>

      {/* Список ссылок */}
      {links.length > 0 && (
        <div className="form-section">
          <h2>Ссылки из базы данных:</h2>
          <ul className="links-list">
            {links.map((link) => (
              <li key={link.id} className="link-item">
                <div className="link-title">{link.title}</div>
                <div className="link-url">
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.url}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}