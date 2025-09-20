'use client';
import './page.css';
import { useState, useEffect } from 'react';

interface Link {
  id: string;
  title: string;
  url: string;
  color?: 'RED' | 'GREEN';  // Добавить поле color (опциональное)
  createdAt: string;
}



export default function Home() {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [links, setLinks] = useState<Link[]>([]);
  const [color, setColor] = useState<'RED' | 'GREEN'>('RED');

  // Автоматическая загрузка ссылок из БД при инициализации компонента
  useEffect(() => {
    const loadLinks = async () => {
      try {
        const response = await fetch('/api/links');
        const data = await response.json();
        
        if (response.ok) {
          setLinks(data.links);
        } else {
          console.error('Ошибка при загрузке ссылок:', data.error);
        }
      } catch (error) {
        console.error('Ошибка при загрузке ссылок из БД:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadLinks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, url, color }),
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        alert('Ссылка добавлена в базу данных!');
        setTitle('');
        setUrl('');
        setColor('RED'); // Сбрасываем выбор цвета к значению по умолчанию
        // Автоматически обновляем список ссылок после добавления
        handleGetLinks();
      } else {
        alert(`Ошибка при добавлении ссылки: ${responseData.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Ошибка при добавлении ссылки:', error);
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

        <div className="form-group">
  <label className="label">Цвет ссылки:</label>
  <div className="color-selector">
    <label className="color-option">
      <input
        type="radio"
        name="color"
        value="RED"
        checked={color === 'RED'}
        onChange={(e) => setColor(e.target.value as 'RED' | 'GREEN')}
      />
      <span className="color-preview red"></span>
      Красный
    </label>
    <label className="color-option">
      <input
        type="radio"
        name="color"
        value="GREEN"
        checked={color === 'GREEN'}
        onChange={(e) => setColor(e.target.value as 'RED' | 'GREEN')}
      />
      <span className="color-preview green"></span>
      Зеленый
    </label>
  </div>
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

      {/* Список ссылок - всегда видимый */}
      <div className="form-section">
        <h2>Ссылки из базы данных:</h2>
        {initialLoading ? (
          <p className="loading-text">Загрузка данных...</p>
        ) : links.length > 0 ? (
          <div className="links-list">
            {links.map((link) => {
              const colorClass = link.color?.toLowerCase() || 'red';
              return (
                <div key={link.id} className={`link-item ${colorClass}`}>
                  <div className="link-title">{link.title}</div>
                  <div className="link-url">
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.url}
                    </a>
                  </div>
                  <div className="link-color-indicator">
                    <span className={`color-dot ${colorClass}`}></span>
                    {link.color === 'RED' ? 'Красный' : link.color === 'GREEN' ? 'Зеленый' : 'Красный'}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="no-links">Ссылки не найдены. Нажмите "Получить из БД" для загрузки данных.</p>
        )}
      </div>
    </div>
  );
}