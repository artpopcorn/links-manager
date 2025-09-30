'use client';

import './admin.css';
import Image from "next/image";
import { useState, useEffect } from 'react';
import Login from './login';
import { checkAuth, logout } from './auth';
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

export default function AdminPage() {
  // Состояние авторизации
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);

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
  const [isHoveringImageBtn, setIsHoveringImageBtn] = useState(false);

  // Состояние редактирования существующих ссылок
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [editingLinkForm, setEditingLinkForm] = useState({
    title: '',
    url: '',
    description: '',
    image: ''
  });

  // Состояние подтверждения удаления
  const [pendingDelete, setPendingDelete] = useState<{
    type: 'parent' | 'child' | 'link' | 'image';
    id: string;
    action: () => Promise<void>;
  } | null>(null);

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
  // Мапа для хранения файлов для каждой ссылки
  const [linkFiles, setLinkFiles] = useState<Map<string, File>>(new Map());

  // Проверка авторизации при загрузке
  useEffect(() => {
    const checkAuthStatus = async () => {
      const authStatus = await checkAuth();
      setIsAuthenticated(authStatus);
      setIsAuthChecked(true);
      
      if (authStatus) {
        fetchCategories();
      }
    };

    checkAuthStatus();
  }, []);

  // Обработчик успешного входа
  const handleLogin = (success: boolean) => {
    if (success) {
      setIsAuthenticated(true);
      fetchCategories();
    }
  };

  // Обработчик выхода
  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    setCategories([]);
    setSelectedParentId('');
    setSelectedChildId('');
    setSelectedLinkId('');
  };

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
          
          // Сохраняем файл для текущей ссылки
          const tempLinkId = 'temp-link-' + Date.now();
          setLinkFiles(prev => new Map(prev.set(tempLinkId, file)));
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

  // Функция для загрузки категорий с сохранением выбора
  const fetchCategoriesWithSelection = async (selections: {
    parentId: string;
    childId: string;
    linkId: string;
  }) => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data.categories);
      
      // Восстанавливаем выбор, если элементы еще существуют
      const parentExists = data.categories.find((cat: any) => cat.id === selections.parentId);
      if (parentExists) {
        setSelectedParentId(selections.parentId);
        
        const childExists = parentExists.childCategories.find((child: any) => child.id === selections.childId);
        if (childExists) {
          setSelectedChildId(selections.childId);
          
          const linkExists = childExists.links.find((link: any) => link.id === selections.linkId);
          if (linkExists) {
            setSelectedLinkId(selections.linkId);
          } else if (childExists.links.length > 0) {
            setSelectedLinkId(childExists.links[0].id);
          }
        } else if (parentExists.childCategories.length > 0) {
          setSelectedChildId(parentExists.childCategories[0].id);
          if (parentExists.childCategories[0].links.length > 0) {
            setSelectedLinkId(parentExists.childCategories[0].links[0].id);
          }
        }
      } else if (data.categories.length > 0) {
        // Если родительская категория не найдена, выбираем первую доступную
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

  // Сбрасываем редактирование при смене ссылки
  useEffect(() => {
    if (isEditingLink) {
      cancelEditingLink();
    }
  }, [selectedLinkId]);

  // Обработчик кликов для отмены удаления
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pendingDelete) {
        const target = event.target as HTMLElement;
        // Проверяем, что клик не по кнопке сохранить
        if (!target.closest('.save_btn')) {
          setPendingDelete(null);
        }
      }
    };

    if (pendingDelete) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [pendingDelete]);

  // Обработчик вставки изображения из буфера обмена (Ctrl+V)
  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      if (!isHoveringImageBtn) return;

      const items = event.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          event.preventDefault();
          const blob = items[i].getAsFile();
          if (blob) {
            // Обрабатываем как обычный файл
            if (isAddingLink) {
              // Для новых ссылок - сохраняем в локальное состояние
              setSelectedFile(blob);
              setIsAddingImage(true);
              const imageUrl = URL.createObjectURL(blob);
              setLinkForm({...linkForm, image: imageUrl});
            } else if (selectedLink) {
              // Для существующих ссылок - загружаем на сервер
              try {
                const formData = new FormData();
                formData.append('file', blob);
                const response = await fetch('/api/upload', {
                  method: 'POST',
                  body: formData,
                });
                const result = await response.json();
                
                if (result.success) {
                  // Удаляем старое изображение если есть
                  if (selectedLink.image) {
                    await fetch(`/api/delete-file?path=${selectedLink.image}`, {
                      method: 'DELETE',
                    });
                  }
                  
                  // Обновляем ссылку с новым изображением
                  await fetch('/api/admin/links', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      id: selectedLink.id,
                      image: result.filePath
                    }),
                  });
                  
                  // Перезагружаем категории
                  await fetchCategoriesWithSelection({
                    parentId: selectedParentId,
                    childId: selectedChildId,
                    linkId: selectedLinkId
                  });
                }
              } catch (error) {
                console.error('Error uploading image from clipboard:', error);
              }
            }
            break;
          }
        }
      }
    };

    if (isHoveringImageBtn) {
      document.addEventListener('paste', handlePaste);
      return () => document.removeEventListener('paste', handlePaste);
    }
  }, [isHoveringImageBtn, isAddingLink, selectedLink, linkForm, selectedParentId, selectedChildId, selectedLinkId]);

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
      if (isAddingLink) {
        setLinkForm({...linkForm, image: ''});
      }
    } else {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          if (isAddingLink) {
            // Для новых ссылок - сохраняем в локальное состояние
            setSelectedFile(file);
            setIsAddingImage(true);
            const imageUrl = URL.createObjectURL(file);
            setLinkForm({...linkForm, image: imageUrl});
          } else if (selectedLink) {
            // Для существующих ссылок - сразу загружаем на сервер и обновляем БД
            try {
              const uploadedPath = await uploadImage(file);
              if (uploadedPath) {
                const response = await fetch(`/api/admin/links`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    id: selectedLink.id,
                    image: uploadedPath
                  })
                });

                if (response.ok) {
                  // Сохраняем текущий выбор
                  const currentSelections = {
                    parentId: selectedParentId,
                    childId: selectedChildId,
                    linkId: selectedLinkId
                  };
                  await fetchCategoriesWithSelection(currentSelections);
                } else {
                  console.error('Failed to update link image');
                }
              }
            } catch (error) {
              console.error('Error adding image:', error);
            }
          }
        }
      };
      input.click();
    }
  };

  // Функция для смены изображения существующей ссылки
  const handleChangeImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && selectedLink) {
        try {
          // Загружаем новое изображение на сервер
          const uploadedPath = await uploadImage(file);
          if (uploadedPath) {
            // Удаляем старое изображение с сервера, если оно есть
            if (selectedLink.image && selectedLink.image.startsWith('/uploads/')) {
              await fetch(`/api/delete-file?path=${selectedLink.image}`, {
                method: 'DELETE'
              });
            }

            // Обновляем изображение в базе данных
            const response = await fetch(`/api/admin/links`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: selectedLink.id,
                image: uploadedPath
              })
            });

            if (response.ok) {
              // Сохраняем текущий выбор и перезагружаем данные
              const currentSelections = {
                parentId: selectedParentId,
                childId: selectedChildId,
                linkId: selectedLinkId
              };
              await fetchCategoriesWithSelection(currentSelections);
            } else {
              console.error('Failed to update link image');
            }
          }
        } catch (error) {
          console.error('Error changing image:', error);
        }
      }
    };
    input.click();
  };

  // Функция для начала редактирования существующей ссылки
  const startEditingLink = () => {
    if (selectedLink && !isAddingLink) {
      setIsEditingLink(true);
      setEditingLinkForm({
        title: selectedLink.title,
        url: selectedLink.url,
        description: selectedLink.description || '',
        image: selectedLink.image || ''
      });
    }
  };

  // Функция для отмены редактирования
  const cancelEditingLink = () => {
    setIsEditingLink(false);
    setEditingLinkForm({
      title: '',
      url: '',
      description: '',
      image: ''
    });
  };

  // Функция для сохранения изменений существующей ссылки
  const saveEditingLink = async () => {
    if (!selectedLink || !editingLinkForm.title.trim() || !editingLinkForm.url.trim()) {
      return;
    }

    try {
      // Сохраняем текущий выбор
      const currentSelections = {
        parentId: selectedParentId,
        childId: selectedChildId,
        linkId: selectedLinkId
      };

      const response = await fetch(`/api/admin/links`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedLink.id,
          title: editingLinkForm.title,
          url: editingLinkForm.url,
          description: editingLinkForm.description
        })
      });

      if (response.ok) {
        // Завершаем редактирование
        setIsEditingLink(false);
        setEditingLinkForm({
          title: '',
          url: '',
          description: '',
          image: ''
        });
        // Перезагружаем данные с сохранением выбора
        await fetchCategoriesWithSelection(currentSelections);
      } else {
        console.error('Failed to update link');
      }
    } catch (error) {
      console.error('Error updating link:', error);
    }
  };

  // Функция для удаления изображения при добавлении новой ссылки
  const handleRemoveNewImage = () => {
    if (!confirm('Вы уверены, что хотите удалить это изображение?')) {
      return;
    }
    
    // Очищаем выбранный файл и изображение в форме
    setSelectedFile(null);
    setLinkForm({...linkForm, image: ''});
    setIsAddingImage(false);
  };

  // Функция для удаления изображения существующей ссылки
  const handleDeleteImage = () => {
    if (!selectedLink || !selectedLink.image) return;

    const deleteAction = async () => {
      try {
        // Удаляем файл с сервера, если это загруженное изображение
        if (selectedLink.image.startsWith('/uploads/')) {
          await fetch(`/api/delete-file?path=${selectedLink.image}`, {
            method: 'DELETE'
          });
        }

        // Обновляем запись в базе данных, убирая изображение
        const response = await fetch(`/api/admin/links`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedLink.id,
            image: null
          })
        });

        if (response.ok) {
          // Сохраняем текущий выбор и перезагружаем данные
          const currentSelections = {
            parentId: selectedParentId,
            childId: selectedChildId,
            linkId: selectedLinkId
          };
          await fetchCategoriesWithSelection(currentSelections);
        } else {
          console.error('Failed to delete link image');
        }
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    };

    // Устанавливаем состояние ожидающего удаления
    setPendingDelete({
      type: 'image',
      id: selectedLink.id,
      action: deleteAction
    });
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
      const tempLinkId = 'temp-link-' + Date.now();
      const tempLink: Link = {
        id: tempLinkId,
        title: linkForm.title,
        url: linkForm.url,
        description: linkForm.description,
        image: linkForm.image
      };

      // Сохраняем файл для этой ссылки, если он есть
      if (selectedFile) {
        setLinkFiles(prev => new Map(prev.set(tempLinkId, selectedFile)));
      }

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

  // Функции удаления
  const handleDeleteParent = (parentId: string) => {
    const deleteAction = async () => {
      try {
        // Если это временная категория, просто удаляем из локального состояния
        if (parentId.startsWith('temp-')) {
          setCategories(prev => prev.filter(cat => cat.id !== parentId));
          // Сбрасываем выбор если удаляем выбранную категорию
          if (selectedParentId === parentId) {
            setSelectedParentId('');
            setSelectedChildId('');
            setSelectedLinkId('');
          }
          return;
        }

        // Удаляем из базы данных
        const response = await fetch(`/api/admin/parent-categories?id=${parentId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          // Перезагружаем данные (выбор сбросится автоматически при удалении)
          await fetchCategories();
        } else {
          console.error('Failed to delete parent category');
        }
      } catch (error) {
        console.error('Error deleting parent category:', error);
      }
    };

    // Устанавливаем состояние ожидающего удаления
    setPendingDelete({
      type: 'parent',
      id: parentId,
      action: deleteAction
    });
  };

  const handleDeleteChild = (childId: string) => {
    const deleteAction = async () => {
      try {
        // Если это временная категория, просто удаляем из локального состояния
        if (childId.startsWith('temp-')) {
          setCategories(prev => 
            prev.map(parent => ({
              ...parent,
              childCategories: parent.childCategories.filter(child => child.id !== childId)
            }))
          );
          // Сбрасываем выбор если удаляем выбранную категорию
          if (selectedChildId === childId) {
            setSelectedChildId('');
            setSelectedLinkId('');
          }
          return;
        }

        // Удаляем из базы данных
        const response = await fetch(`/api/admin/child-categories?id=${childId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          // Перезагружаем данные (выбор сбросится автоматически при удалении)
          await fetchCategories();
        } else {
          console.error('Failed to delete child category');
        }
      } catch (error) {
        console.error('Error deleting child category:', error);
      }
    };

    // Устанавливаем состояние ожидающего удаления
    setPendingDelete({
      type: 'child',
      id: childId,
      action: deleteAction
    });
  };

  const handleDeleteLink = (linkId: string) => {
    const deleteAction = async () => {
      try {
        // Если это временная ссылка, просто удаляем из локального состояния
        if (linkId.startsWith('temp-')) {
          setCategories(prev => 
            prev.map(parent => ({
              ...parent,
              childCategories: parent.childCategories.map(child => ({
                ...child,
                links: child.links.filter(link => link.id !== linkId)
              }))
            }))
          );
          // Удаляем файл из мапы если он есть
          setLinkFiles(prev => {
            const newMap = new Map(prev);
            newMap.delete(linkId);
            return newMap;
          });
          // Сбрасываем выбор если удаляем выбранную ссылку
          if (selectedLinkId === linkId) {
            setSelectedLinkId('');
          }
          return;
        }

        // Удаляем из базы данных
        const response = await fetch(`/api/admin/links?id=${linkId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          // Перезагружаем данные (выбор сбросится автоматически при удалении)
          await fetchCategories();
        } else {
          console.error('Failed to delete link');
        }
      } catch (error) {
        console.error('Error deleting link:', error);
      }
    };

    // Устанавливаем состояние ожидающего удаления
    setPendingDelete({
      type: 'link',
      id: linkId,
      action: deleteAction
    });
  };

  // Функция для загрузки изображения на сервер
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.filePath;
      } else {
        console.error('Failed to upload image');
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  // Универсальная функция сохранения
  const handleUniversalSave = async () => {
    // Если есть ожидающее удаление - выполняем его
    if (pendingDelete) {
      await pendingDelete.action();
      setPendingDelete(null);
      return;
    }
    
    // Если есть несохраненные изменения (добавление новых элементов)
    if (hasUnsavedChanges) {
      return handleAddToList();
    }
    
    // Если редактируем существующую ссылку
    if (hasEditingChanges) {
      return saveEditingLink();
    }
    
    // Если есть несохраненные данные в БД
    if (hasUnsavedData) {
      return handleSaveToDatabase();
    }
  };

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
            
            // Если есть изображение и это blob URL, загружаем его на сервер
            let finalImagePath = link.image;
            if (link.image && link.image.startsWith('blob:')) {
              const linkFile = linkFiles.get(link.id);
              if (linkFile) {
                console.log('Uploading image to server...');
                const uploadedPath = await uploadImage(linkFile);
                if (uploadedPath) {
                  finalImagePath = uploadedPath;
                  console.log('Image uploaded to:', uploadedPath);
                }
              }
            }
            
            console.log('Link data:', {
              title: link.title,
              url: link.url,
              description: link.description,
              image: finalImagePath,
              categoryId: realChildId 
            });
            
            const response = await fetch('/api/admin/links', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                title: link.title,
                url: link.url,
                description: link.description,
                image: finalImagePath,
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
      // Очищаем мапу файлов после успешного сохранения
      setLinkFiles(new Map());
      
      // Сохраняем текущий выбор если он есть
      if (selectedParentId && selectedChildId && selectedLinkId) {
        const currentSelections = {
          parentId: selectedParentId,
          childId: selectedChildId,
          linkId: selectedLinkId
        };
        await fetchCategoriesWithSelection(currentSelections);
      } else {
        // Если выбора нет, загружаем обычным способом
        await fetchCategories();
      }
      
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
  const hasEditingChanges = isEditingLink;

  // Показываем лоадер пока проверяем авторизацию
  if (!isAuthChecked) {
    return <Loading />;
  }

  // Показываем форму входа если не авторизован
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Показываем интерфейс админки если авторизован
  return (
    <div className="container">
      
      <div className="island">
        <div className="island_admin">
          <div className="island_admin_exit" onClick={handleLogout}>
            <Image src="/exit.svg" alt="Выход" width={40} height={40} priority />
          </div>
        </div>
        <div 
          className={`save_btn ${hasUnsavedChanges || hasEditingChanges ? 'add' : ''} ${pendingDelete ? 'delete' : ''}`}
          onClick={handleUniversalSave}
        >
          {pendingDelete ? 'Удалить' : (hasUnsavedChanges ? 'Добавить' : 'Сохранить')}
        </div> 
      </div>

      <div className="container_links">
        
        {/* Родительские рубрики */}
        <div className="category_list">
          <div 
            className={`add_btn ${isAddingParent ? 'close' : ''}`}
            onClick={handleAddParent}
          ></div>
          
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
              <div className="category_item_text">
                {category.title}
              </div>
              <Image 
                src="/delete.svg" 
                alt="Delete" 
                width={20} 
                height={20} 
                className="delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteParent(category.id);
                }}
              />
            </div>
          ))}
        </div>

        {/* Дочерние рубрики - показываем только если есть выбранная родительская категория */}
        {selectedParent && (
        <div className="inner_category">
          <div 
            className={`add_btn ${isAddingChild ? 'close' : ''}`}
            onClick={handleAddChild}
          ></div>
          
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
              <div className="category_item_text">
                {childCategory.title}
              </div>
              <Image 
                src="/delete.svg" 
                alt="Delete" 
                width={20} 
                height={20} 
                className="delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChild(childCategory.id);
                }}
              />
            </div>
          ))}
        </div>
        )}

        {/* Ссылки - показываем только если есть выбранная дочерняя категория */}
        {selectedChild && (
        <div className="links_list">
          <div 
            className={`add_btn ${isAddingLink ? 'close' : ''}`}
            onClick={handleAddLink}
          ></div>
          
          {selectedChild?.links.map((link) => (
            <div 
              key={link.id} 
              className={`links_item ${selectedLinkId === link.id ? 'active' : ''} ${link.id.startsWith('temp-') ? 'temp-item' : ''}`}
              onClick={() => setSelectedLinkId(link.id)}
            >
              <div className="category_item_text">
                {link.title}
              </div>
              <Image 
                src="/delete.svg" 
                alt="Delete" 
                width={20} 
                height={20} 
                className="delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteLink(link.id);
                }}
              />
            </div>
          ))}
        </div>
        )}

        {/* Детали ссылки - показываем только если есть выбранная или добавляемая ссылка */}
        {(selectedLink || isAddingLink) && (
        <div className="link_info">
          {/* Кнопка добавления изображения для новых ссылок или существующих без изображения */}
          {((isAddingLink && !selectedFile) || (selectedLink && !selectedLink.image && !isAddingLink)) && (
            <div 
              className={`add_btn_img ${isAddingImage ? 'close' : ''}`}
              onClick={handleAddImage}
              onMouseEnter={() => setIsHoveringImageBtn(true)}
              onMouseLeave={() => setIsHoveringImageBtn(false)}
              title="Нажмите для выбора файла или Ctrl+V для вставки из буфера обмена"
            ></div>
          )}
          
          {((selectedLink?.image && !isAddingLink) || (isAddingLink && selectedFile)) && (
            <div className="link_info_image">

              {/* Показываем иконки управления для существующих ссылок и при добавлении новой с изображением */}
              {((selectedLink?.image && !isAddingLink) || (isAddingLink && selectedFile)) && (
                <div className="link_info_image_container">
                  <Image 
                    src="/changeimg.svg" 
                    alt="Change Image" 
                    width={40} 
                    height={40} 
                    priority 
                    className={'changeimg'}
                    onClick={isAddingLink ? handleAddImage : handleChangeImage}
                  />

                  <Image 
                    src="/delimg.svg" 
                    alt="Delete Image" 
                    width={40} 
                    height={40} 
                    priority 
                    className={'delimg'}
                    onClick={isAddingLink ? handleRemoveNewImage : handleDeleteImage}
                  />
                </div>
              )}

                
              <img
                src={isAddingLink && selectedFile ? URL.createObjectURL(selectedFile) : selectedLink?.image}
                alt={selectedLink?.title || "Новое изображение"}
                width="800"
                height="600"
                className={'linkimg'}
              />
            </div>
          )}

          {(selectedLink || isAddingLink) && (
            <div className="form_info">   
              <input 
                type="text" 
                placeholder='Заголовок' 
                value={
                  isAddingLink 
                    ? linkForm.title 
                    : isEditingLink 
                      ? editingLinkForm.title 
                      : (selectedLink?.title || '')
                }
                onChange={(e) => {
                  if (isAddingLink) {
                    setLinkForm({...linkForm, title: e.target.value});
                  } else if (isEditingLink) {
                    setEditingLinkForm({...editingLinkForm, title: e.target.value});
                  } else if (selectedLink) {
                    // Начинаем редактирование при первом изменении
                    startEditingLink();
                    setEditingLinkForm({
                      title: e.target.value,
                      url: selectedLink.url,
                      description: selectedLink.description || '',
                      image: selectedLink.image || ''
                    });
                  }
                }}
                className='title_input'
              />
              <input 
                type="text" 
                placeholder='Ссылка' 
                value={
                  isAddingLink 
                    ? linkForm.url 
                    : isEditingLink 
                      ? editingLinkForm.url 
                      : (selectedLink?.url || '')
                }
                onChange={(e) => {
                  if (isAddingLink) {
                    setLinkForm({...linkForm, url: e.target.value});
                  } else if (isEditingLink) {
                    setEditingLinkForm({...editingLinkForm, url: e.target.value});
                  } else if (selectedLink) {
                    // Начинаем редактирование при первом изменении
                    startEditingLink();
                    setEditingLinkForm({
                      title: selectedLink.title,
                      url: e.target.value,
                      description: selectedLink.description || '',
                      image: selectedLink.image || ''
                    });
                  }
                }}
                className='link_input'
              />
              <textarea 
                placeholder='Описание' 
                value={
                  isAddingLink 
                    ? linkForm.description 
                    : isEditingLink 
                      ? editingLinkForm.description 
                      : (selectedLink?.description || '')
                }
                onChange={(e) => {
                  if (isAddingLink) {
                    setLinkForm({...linkForm, description: e.target.value});
                  } else if (isEditingLink) {
                    setEditingLinkForm({...editingLinkForm, description: e.target.value});
                  } else if (selectedLink) {
                    // Начинаем редактирование при первом изменении
                    startEditingLink();
                    setEditingLinkForm({
                      title: selectedLink.title,
                      url: selectedLink.url,
                      description: e.target.value,
                      image: selectedLink.image || ''
                    });
                  }
                }}
                className='description_textarea'
              />
            </div>
          )}
        </div>
        )}

      </div>
    </div>
  );
}