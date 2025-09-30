'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Loading from '@/components/Loading';


interface Link {
  id: string;
  title: string;
  url: string;
  description: string;
  image: string;
}

interface ChildCategory {
  id: string;
  title: string;
  links: Link[];
}

interface ParentCategory {
  id: string;
  title: string;
  childCategories: ChildCategory[];
}

export default function Home() {
  const [categories, setCategories] = useState<ParentCategory[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [selectedLinkId, setSelectedLinkId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Загрузка данных
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data.categories);
        
        // Автоматически выбираем первую родительскую категорию
        if (data.categories.length > 0) {
          setSelectedParentId(data.categories[0].id);
          
          // Автоматически выбираем первую дочернюю категорию
          if (data.categories[0].childCategories.length > 0) {
            setSelectedChildId(data.categories[0].childCategories[0].id);
            
            // Автоматически выбираем первую ссылку
            if (data.categories[0].childCategories[0].links.length > 0) {
              setSelectedLinkId(data.categories[0].childCategories[0].links[0].id);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // Получение текущих данных
  const selectedParent = categories.find(cat => cat.id === selectedParentId);
  const selectedChild = selectedParent?.childCategories.find(child => child.id === selectedChildId);
  const selectedLink = selectedChild?.links.find(link => link.id === selectedLinkId);

  // Обработчики кликов
  const handleParentClick = (parentId: string) => {
    setSelectedParentId(parentId);
    const parent = categories.find(cat => cat.id === parentId);
    
    // Автоматически выбираем первую дочернюю категорию
    if (parent && parent.childCategories.length > 0) {
      setSelectedChildId(parent.childCategories[0].id);
      
      // Автоматически выбираем первую ссылку
      if (parent.childCategories[0].links.length > 0) {
        setSelectedLinkId(parent.childCategories[0].links[0].id);
      } else {
        setSelectedLinkId('');
      }
    } else {
      setSelectedChildId('');
      setSelectedLinkId('');
    }
  };

  const handleChildClick = (childId: string) => {
    setSelectedChildId(childId);
    const child = selectedParent?.childCategories.find(c => c.id === childId);
    
    // Автоматически выбираем первую ссылку
    if (child && child.links.length > 0) {
      setSelectedLinkId(child.links[0].id);
    } else {
      setSelectedLinkId('');
    }
  };

  const handleLinkClick = (linkId: string) => {
    setSelectedLinkId(linkId);
  };


  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container">

      <div className="container_links">
        
        {/* Родительские рубрики */}
        <div className="category_list">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className={`category_item ${selectedParentId === category.id ? 'active' : ''}`}
              onClick={() => handleParentClick(category.id)}
              style={{ cursor: 'pointer' }}
            >
              {category.title}
            </div>
          ))}
        </div>

        {/* Дочерние рубрики */}
        {selectedParent && (
          <div className="inner_category">
            {selectedParent.childCategories.map((childCategory) => (
              <div 
                key={childCategory.id} 
                className={`inner_category_item ${selectedChildId === childCategory.id ? 'active' : ''}`}
                onClick={() => handleChildClick(childCategory.id)}
                style={{ cursor: 'pointer' }}
              >
                {childCategory.title}
              </div>
            ))}
          </div>
        )}

        {/* Ссылки */}
        {selectedChild && (
          <div className="links_list">
            {selectedChild.links.map((link) => (
              <div 
                key={link.id} 
                className={`links_item ${selectedLinkId === link.id ? 'active' : ''}`}
                onClick={() => handleLinkClick(link.id)}
                style={{ cursor: 'pointer' }}
              >
                {link.title}
              </div>
            ))}
          </div>
        )}

      {/* Детали ссылки */}
{selectedLink && (
  <div className="link_info">
    {/* Показываем картинку только если она есть */}
    {selectedLink.image && (
      <div className="link_info_image">
        <img 
          src={selectedLink.image} 
          alt={selectedLink.title} 
          width={800} 
          height={600} 
          className={'linkimg'}

        />
      </div>
    )}

    <h2 className="link_info_title">
      {selectedLink.title}
    </h2>

            <a href={selectedLink.url} className="link_info_link" target="_blank" rel="noopener noreferrer">
              <span>{selectedLink.url}</span>
              <Image src="/link.svg" alt="" width={20} height={20} priority />
            </a>

            <div className="link_info_description">
              {selectedLink.description}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}