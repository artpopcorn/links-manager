'use client';

import './admin.css';
import Image from "next/image";
import { useState, useEffect } from 'react';

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

export default function AdminPage() {
  // Состояние данных
  const [categories, setCategories] = useState<ParentCategory[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [selectedLinkId, setSelectedLinkId] = useState<string>('');

  // Состояние форм добавления
  const [isAddingParent, setIsAddingParent] = useState(false);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [isAddingImage, setIsAddingImage] = useState(false);

  // Состояние форм
  const [parentTitle, setParentTitle] = useState('');
  const [childTitle, setChildTitle] = useState('');
  const [linkForm, setLinkForm] = useState({
    title: '',
    url: '',
    description: '',
    image: ''
  });

  // Состояние для загрузки файлов
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Загрузка данных
  useEffect(() => {
    fetchCategories();
  }, []);

  // Обработчик Ctrl+V для вставки изображений
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (isAddingLink && e.clipboardData?.files.length) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          setSelectedFile(file);
          setIsAddingImage(true);
          const imageUrl = URL.createObjectURL(file);
          setLinkForm({...linkForm, image: imageUrl});
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [isAddingLink, linkForm]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data.categories);
      
      if (data.categories.length > 0) {
        setSelectedParentId(data.categories[0].id);
        if (data.categories[0].childCategories.length > 0) {
          setSelectedChildId(data.categories[0].childCategories[0].id);
          if (data.categories[0].childCategories[0].links.length > 0) {
            setSelectedLinkId(data.categories[0].childCategories[0].links[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Получение текущих данных
  const selectedParent = categories.find(cat => cat.id === selectedParentId);
  const selectedChild = selectedParent?.childCategories.find(child => child.id === selectedChildId);
  const selectedLink = selectedChild?.links.find(link => link.id === selectedLinkId);

  // Обработчики добавления с переключением состояния
  const handleAddParent = () => {
    if (isAddingParent) {
      setIsAddingParent(false);
      setParentTitle('');
    } else {
      setIsAddingParent(true);
      setParentTitle('');
    }
  };

  const handleAddChild = () => {
    if (isAddingChild) {
      setIsAddingChild(false);
      setChildTitle('');
    } else {
      setIsAddingChild(true);
      setChildTitle('');
    }
  };

  const handleAddLink = () => {
    if (isAddingLink) {
      setIsAddingLink(false);
      setIsAddingImage(false);
      setSelectedFile(null);
      setLinkForm({ title: '', url: '', description: '', image: '' });
    } else {
      setIsAddingLink(true);
      setLinkForm({ title: '', url: '', description: '', image: '' });
    }
  };

  const handleAddImage = () => {
    if (isAddingImage) {
      setIsAddingImage(false);
      setSelectedFile(null);
      setLinkForm({...linkForm, image: ''});
    } else {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          setSelectedFile(file);
          setIsAddingImage(true);
          const imageUrl = URL.createObjectURL(file);
          setLinkForm({...linkForm, image: imageUrl});
        }
      };
      input.click();
    }
  };

  // Добавление в локальный список (показать в интерфейсе)
  const handleAddToList = () => {
    // Добавление родительской категории
    if (isAddingParent && parentTitle.trim()) {
      const tempParent: ParentCategory = {
        id: 'temp-parent-' + Date.now(),
        title: parentTitle,
        childCategories: []
      };
      
      setCategories(prev => [...prev, tempParent]);
      setIsAddingParent(false);
      setParentTitle('');
      setSelectedParentId(tempParent.id);
      return;
    }

    // Добавление дочерней категории
    if (isAddingChild && childTitle.trim() && selectedParentId) {
      const tempChild: ChildCategory = {
        id: 'temp-child-' + Date.now(),
        title: childTitle,
        links: []
      };

      setCategories(prevCategories => 
        prevCategories.map(category => {
          if (category.id === selectedParentId) {
            return {
              ...category,
              childCategories: [...category.childCategories, tempChild]
            };
          }
          return category;
        })
      );

      setIsAddingChild(false);
      setChildTitle('');
      setSelectedChildId(tempChild.id);
      return;
    }

    // Добавление ссылки
    if (isAddingLink && linkForm.title.trim() && linkForm.url.trim() && selectedChildId) {
      const tempLink: Link = {
        id: 'temp-link-' + Date.now(),
        title: linkForm.title,
        url: linkForm.url,
        description: linkForm.description,
        image: linkForm.image
      };

      setCategories(prevCategories => 
        prevCategories.map(category => {
          if (category.id === selectedParentId) {
            return {
              ...category,
              childCategories: category.childCategories.map(child => {
                if (child.id === selectedChildId) {
                  return {
                    ...child,
                    links: [...child.links, tempLink]
                  };
                }
                return child;
              })
            };
          }
          return category;
        })
      );

      setIsAddingLink(false);
      setIsAddingImage(false);
      setSelectedFile(null);
      setLinkForm({ title: '', url: '', description: '', image: '' });
      setSelectedLinkId(tempLink.id);
      return;
    }
  };

  // Сохранение в базу данных
// Сохранение в базу данных
const handleSaveToDatabase = async () => {
    try {
      console.log('Starting save to database...');
      
      // Мапа для сопоставления временных ID с реальными
      const idMap = new Map<string, string>();
  
      // 1. Сначала сохраняем родительские категории
      const unsavedParents = categories.filter(cat => cat.id.startsWith('temp-parent-'));
      console.log('Unsaved parents:', unsavedParents.length);
      
      for (const parent of unsavedParents) {
        console.log('Saving parent:', parent.title);
        const response = await fetch('/api/admin/parent-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: parent.title })
        });
        
        if (response.ok) {
          const data = await response.json();
          idMap.set(parent.id, data.parentCategory.id);
          console.log('Parent saved, mapping:', parent.id, '->', data.parentCategory.id);
        } else {
          console.error('Failed to save parent:', parent.title);
        }
      }
  
      // 2. Затем сохраняем дочерние категории
      for (const parent of categories) {
        const realParentId = parent.id.startsWith('temp-parent-') 
          ? idMap.get(parent.id) 
          : parent.id;
        
        console.log('Processing parent:', parent.title, 'realParentId:', realParentId);
        
        if (!realParentId) {
          console.log('Skipping parent - no real ID');
          continue;
        }
  
        const unsavedChildren = parent.childCategories.filter(child => child.id.startsWith('temp-child-'));
        console.log('Unsaved children for parent:', unsavedChildren.length);
        
        for (const child of unsavedChildren) {
          console.log('Saving child:', child.title, 'for parent:', realParentId);
          const response = await fetch('/api/admin/child-categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              title: child.title, 
              parentId: realParentId 
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            idMap.set(child.id, data.childCategory.id);
            console.log('Child saved, mapping:', child.id, '->', data.childCategory.id);
          } else {
            console.error('Failed to save child:', child.title);
          }
        }
      }
  
      // 3. Наконец сохраняем ссылки
      for (const parent of categories) {
        for (const child of parent.childCategories) {
          const realChildId = child.id.startsWith('temp-child-') 
            ? idMap.get(child.id) 
            : child.id;
          
          console.log('Processing child:', child.title, 'realChildId:', realChildId);
          
          if (!realChildId) {
            console.log('Skipping child - no real ID');
            continue;
          }
  
          const unsavedLinks = child.links.filter(link => link.id.startsWith('temp-link-'));
          console.log('Unsaved links for child:', unsavedLinks.length);
          
          for (const link of unsavedLinks) {
            console.log('Saving links for child:', realChildId);
            console.log('Link data:', {
              title: link.title,
              url: link.url,
              description: link.description,
              image: link.image,
              categoryId: realChildId 
            });
            
            const response = await fetch('/api/admin/links', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                title: link.title,
                url: link.url,
                description: link.description,
                image: link.image,
                categoryId: realChildId 
              })
            });
            
            if (response.ok) {
              console.log('Link saved successfully:', link.title);
            } else {
              const errorData = await response.json();
              console.error('Failed to save link:', link.title, 'Error:', errorData);
            }
          }
        }
      }
      
      console.log('Save completed, reloading data...');
      // Перезагружаем данные из БД
      await fetchCategories();
      
    } catch (error) {
      console.error('Error saving to database:', error);
    }
  };

  // Определяем наличие изменений
  const hasUnsavedChanges = isAddingParent || isAddingChild || isAddingLink;
  const hasUnsavedData = categories.some(cat => 
    cat.id.startsWith('temp-') || 
    cat.childCategories.some(child => 
      child.id.startsWith('temp-') || 
      child.links.some(link => link.id.startsWith('temp-'))
    )
  );

  return (
    <div className="container">
      
      <div className="island">
        <div className="island_admin">
          <div className="island_admin_exit">
            <Image src="/exit.svg" alt="" width={40} height={40} priority />
          </div>
          <div className="island_admin_profile">
            <div className="island_admin_profile_img">
              <img src="/admin.jpg" alt="" width={20} height={20} />
            </div>
            <div className="island_admin_profile_name">admin</div>
          </div>
        </div>
        <div 
          className={`save_btn ${hasUnsavedChanges ? 'add' : ''}`}
          onClick={hasUnsavedChanges ? handleAddToList : handleSaveToDatabase}
        >
          {hasUnsavedChanges ? 'Добавить' : (hasUnsavedData ? 'Сохранить' : 'Сохранить')}
        </div> 
      </div>

      <div className="container_links">
        
        {/* Родительские рубрики */}
        <div className="category_list">
          <Image 
            src="/add.svg" 
            alt="" 
            width={40} 
            height={40} 
            priority 
            className={`add_btn ${isAddingParent ? 'close' : ''}`}
            onClick={handleAddParent}
          />
          
          {isAddingParent && (
            <input 
              type="text" 
              placeholder='Родительская рубрика' 
              value={parentTitle}
              onChange={(e) => setParentTitle(e.target.value)}
              className='category_input'
            />
          )}
          
          {categories.map((category) => (
            <div 
              key={category.id} 
              className={`category_item ${selectedParentId === category.id ? 'active' : ''} ${category.id.startsWith('temp-') ? 'temp-item' : ''}`}
              onClick={() => setSelectedParentId(category.id)}
            >
              {category.title}
            </div>
          ))}
        </div>

        {/* Дочерние рубрики */}
        <div className="inner_category">
          <Image 
            src="/add.svg" 
            alt="" 
            width={40} 
            height={40} 
            priority 
            className={`add_btn ${isAddingChild ? 'close' : ''}`}
            onClick={handleAddChild}
          />
          
          {isAddingChild && (
            <input 
              type="text" 
              placeholder='Дочерняя рубрика' 
              value={childTitle}
              onChange={(e) => setChildTitle(e.target.value)}
              className='inner_category_input'
            />
          )}
          
          {selectedParent?.childCategories.map((childCategory) => (
            <div 
              key={childCategory.id} 
              className={`inner_category_item ${selectedChildId === childCategory.id ? 'active' : ''} ${childCategory.id.startsWith('temp-') ? 'temp-item' : ''}`}
              onClick={() => setSelectedChildId(childCategory.id)}
            >
              {childCategory.title}
            </div>
          ))}
        </div>

        {/* Ссылки */}
        <div className="links_list">
          <Image 
            src="/add.svg" 
            alt="" 
            width={40} 
            height={40} 
            priority 
            className={`add_btn ${isAddingLink ? 'close' : ''}`}
            onClick={handleAddLink}
          />
          
          {selectedChild?.links.map((link) => (
            <div 
              key={link.id} 
              className={`links_item ${selectedLinkId === link.id ? 'active' : ''} ${link.id.startsWith('temp-') ? 'temp-item' : ''}`}
              onClick={() => setSelectedLinkId(link.id)}
            >
              {link.title}
            </div>
          ))}
        </div>

        {/* Детали ссылки */}
        <div className="link_info">
          {(isAddingLink && !selectedFile) && (
            <Image 
              src="/add.svg" 
              alt="" 
              width={40} 
              height={40} 
              priority 
              className={`add_btn_img ${isAddingImage ? 'close' : ''}`}
              onClick={handleAddImage}
            />
          )}
          
          {((selectedLink?.image && !isAddingLink) || (isAddingLink && selectedFile)) && (
            <div className="link_info_image">
              <img
                src={isAddingLink && selectedFile ? URL.createObjectURL(selectedFile) : selectedLink?.image}
                alt={selectedLink?.title || "Новое изображение"}
                width="800"
                height="600"
              />
            </div>
          )}

          {(selectedLink || isAddingLink) && (
            <div className="form_info">   
              <input 
                type="text" 
                placeholder='Заголовок' 
                value={isAddingLink ? linkForm.title : (selectedLink?.title || '')}
                onChange={(e) => {
                  if (isAddingLink) {
                    setLinkForm({...linkForm, title: e.target.value});
                  }
                }}
                className='title_input'
              />
              <input 
                type="text" 
                placeholder='Ссылка' 
                value={isAddingLink ? linkForm.url : (selectedLink?.url || '')}
                onChange={(e) => {
                  if (isAddingLink) {
                    setLinkForm({...linkForm, url: e.target.value});
                  }
                }}
                className='link_input'
              />
              <textarea 
                placeholder='Описание' 
                value={isAddingLink ? linkForm.description : (selectedLink?.description || '')}
                onChange={(e) => {
                  if (isAddingLink) {
                    setLinkForm({...linkForm, description: e.target.value});
                  }
                }}
                className='description_textarea'
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}