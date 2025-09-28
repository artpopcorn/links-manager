// Импортируем инструменты Next.js для работы с HTTP-запросами и ответами
import { NextRequest, NextResponse } from 'next/server'
// Импортируем подключение к базе данных через Prisma
import { prisma } from '@/lib/db'

// Функция для создания новой ссылки (обрабатывает POST-запросы)
export async function POST(request: NextRequest) {
  try {
    // Извлекаем данные из тела запроса (JSON)
    const { title, url, description, image, categoryId }: { 
      title: string; 
      url: string; 
      description?: string;
      image?: string;
      categoryId: string;
    } = await request.json()
    
    // Проверяем обязательные поля
    if (!title || !url || !categoryId) {
      return NextResponse.json(
        { error: 'Title, url and categoryId are required' },
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