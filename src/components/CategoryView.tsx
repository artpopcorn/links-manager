'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import Loading from '@/components/Loading';

interface Link {
  id: string;
  title: string;
  url: string;
  description: string;
  image: string;
  slug: string;
}

interface ChildCategory {
  id: string;
  title: string;
  slug: string;
  links: Link[];
}

interface ParentCategory {
  id: string;
  title: string;
  slug: string;
  childCategories: ChildCategory[];
}

interface CategoryViewProps {
  parentSlug?: string;
  childSlug?: string;
  linkSlug?: string;
}

export default function CategoryView({ parentSlug, childSlug, linkSlug }: CategoryViewProps) {
  const router = useRouter();
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
        
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
          
          if (parentSlug) {
            const parent = data.categories.find((c: ParentCategory) => c.slug === parentSlug);
            if (parent) {
              setSelectedParentId(parent.id);
              
              if (childSlug) {
                const child = parent.childCategories.find((c: ChildCategory) => c.slug === childSlug);
                if (child) {
                  setSelectedChildId(child.id);
                  
                  if (linkSlug) {
                    const link = child.links.find((l: Link) => l.slug === linkSlug);
                    if (link) {
                      setSelectedLinkId(link.id);
                    }
                  } else if (child.links.length > 0) {
                    setSelectedLinkId(child.links[0].id);
                  }
                }
              } else if (parent.childCategories.length > 0) {
                setSelectedChildId(parent.childCategories[0].id);
                if (parent.childCategories[0].links.length > 0) {
                  setSelectedLinkId(parent.childCategories[0].links[0].id);
                }
              }
            }
          } else {
            // Автоматически выбираем первую родительскую категорию
            if (data.categories.length > 0) {
              setSelectedParentId(data.categories[0].id);
              
              if (data.categories[0].childCategories.length > 0) {
                setSelectedChildId(data.categories[0].childCategories[0].id);
                
                if (data.categories[0].childCategories[0].links.length > 0) {
                  setSelectedLinkId(data.categories[0].childCategories[0].links[0].id);
                }
              }
            }
          }
        } else {
          console.error('Invalid data format:', data);
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, [parentSlug, childSlug, linkSlug]);

  const selectedParent = categories.find(cat => cat.id === selectedParentId);
  const selectedChild = selectedParent?.childCategories.find(child => child.id === selectedChildId);
  const selectedLink = selectedChild?.links.find(link => link.id === selectedLinkId);

  const handleParentClick = (parentId: string) => {
    const parent = categories.find(cat => cat.id === parentId);
    if (parent) {
      if (parent.childCategories.length > 0) {
        if (parent.childCategories[0].links.length > 0) {
          router.push(`/${parent.slug}/${parent.childCategories[0].slug}/${parent.childCategories[0].links[0].slug}`);
        } else {
          router.push(`/${parent.slug}/${parent.childCategories[0].slug}`);
        }
      } else {
        router.push(`/${parent.slug}`);
      }
    }
  };

  const handleChildClick = (childId: string) => {
    const child = selectedParent?.childCategories.find(c => c.id === childId);
    if (child && selectedParent) {
      if (child.links.length > 0) {
        router.push(`/${selectedParent.slug}/${child.slug}/${child.links[0].slug}`);
      } else {
        router.push(`/${selectedParent.slug}/${child.slug}`);
      }
    }
  };

  const handleLinkClick = (linkId: string) => {
    const link = selectedChild?.links.find(l => l.id === linkId);
    if (link && selectedParent && selectedChild) {
      router.push(`/${selectedParent.slug}/${selectedChild.slug}/${link.slug}`);
    }
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

