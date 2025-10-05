// Импортируем инструменты Next.js для работы с HTTP-запросами и ответами
import { NextRequest, NextResponse } from 'next/server'
// Импортируем подключение к базе данных через Prisma
import { prisma } from '@/lib/db'

// Функция для создания новой ссылки (обрабатывает POST-запросы)
export async function POST(request: NextRequest) {
  try {
    // Извлекаем данные из тела запроса (JSON)
    const { title, url, description, image, categoryId, slug }: { 
      title: string; 
      url: string; 
      description?: string;
      image?: string;
      categoryId: string;
      slug: string;
    } = await request.json()
    
    // Проверяем обязательные поля
    if (!title || !url || !categoryId || !slug) {
      return NextResponse.json(
        { error: 'Title, url, categoryId and slug are required' },
        { status: 400 }
      );
    }
    
    // Создаем новую запись в базе данных в таблице link
    const link = await prisma.link.create({
      data: {
        title,                         // Заголовок ссылки
        url,                          // Адрес ссылки
        description: description || '', // Описание ссылки
        image: image || null,          // URL картинки
        slug,                         // Slug для ЧПУ
        categoryId,                    // ID дочерней категории
        order: 0                      // Порядок сортировки
      }
    })
    
    // Возвращаем успешный ответ с созданной ссылкой
    return NextResponse.json({ success: true, link })
  } catch (error) {
    // Выводим ошибку в консоль для отладки
    console.error('Error creating link:', error)
    // Возвращаем ошибку клиенту с кодом 500
    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 })
  }
}

// Функция для получения всех ссылок (обрабатывает GET-запросы)
export async function GET() {
  try {
    // Получаем все ссылки из базы данных с информацией о категориях
    const links = await prisma.link.findMany({
      include: {
        childCategory: {
          include: {
            parentCategory: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // Сортируем по дате создания (новые сверху)
      }
    })
    
    // Возвращаем список ссылок в JSON формате
    return NextResponse.json({ links })
  } catch (error) {
    // Выводим ошибку в консоль для отладки
    console.error('Error fetching links:', error)
    // Возвращаем ошибку клиенту с кодом 500
    return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 })
  }
}

// Функция для обновления ссылки (обрабатывает PUT-запросы)
export async function PUT(request: NextRequest) {
  try {
    const { id, title, url, description, image, slug, order }: { 
      id: string;
      title?: string; 
      url?: string; 
      description?: string;
      image?: string;
      slug?: string;
      order?: number;
    } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Link ID is required' },
        { status: 400 }
      );
    }
    
    // Создаем объект с полями для обновления
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (url !== undefined) updateData.url = url;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (slug !== undefined) updateData.slug = slug;
    if (order !== undefined) updateData.order = order;
    
    const link = await prisma.link.update({
      where: { id },
      data: updateData
    })
    
    return NextResponse.json({ success: true, link })
  } catch (error) {
    console.error('Error updating link:', error)
    return NextResponse.json({ error: 'Failed to update link' }, { status: 500 })
  }
}

// Функция для удаления ссылки (обрабатывает DELETE-запросы)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Link ID is required' },
        { status: 400 }
      );
    }
    
    await prisma.link.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 });
  }
}