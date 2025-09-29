import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { title } = await request.json();
    
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Создаем slug из заголовка
    const slug = title.toLowerCase()
      .replace(/[^a-zA-Z0-9а-яё\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    const parentCategory = await prisma.parentCategory.create({
      data: {
        title,
        slug,
        order: 0
      }
    });

    return NextResponse.json({ parentCategory });
  } catch (error) {
    console.error('Error creating parent category:', error);
    return NextResponse.json(
      { error: 'Failed to create parent category' },
      { status: 500 }
    );
  }
}

// Функция для удаления родительской категории (обрабатывает DELETE-запросы)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Parent category ID is required' },
        { status: 400 }
      );
    }
    
    // Удаляем родительскую категорию (каскадное удаление удалит дочерние категории и ссылки)
    await prisma.parentCategory.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting parent category:', error);
    return NextResponse.json({ error: 'Failed to delete parent category' }, { status: 500 });
  }
}