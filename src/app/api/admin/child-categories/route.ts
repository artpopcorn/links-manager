import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { title, parentId } = await request.json();
    
    if (!title || !parentId) {
      return NextResponse.json(
        { error: 'Title and parentId are required' },
        { status: 400 }
      );
    }

    const slug = title.toLowerCase()
      .replace(/[^a-zA-Z0-9а-яё\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    const childCategory = await prisma.childCategory.create({
      data: {
        title,
        slug,
        parentId,
        order: 0
      }
    });

    return NextResponse.json({ childCategory });
  } catch (error) {
    console.error('Error creating child category:', error);
    return NextResponse.json(
      { error: 'Failed to create child category' },
      { status: 500 }
    );
  }
}

// Функция для удаления дочерней категории (обрабатывает DELETE-запросы)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Child category ID is required' },
        { status: 400 }
      );
    }
    
    // Удаляем дочернюю категорию (каскадное удаление удалит все ссылки)
    await prisma.childCategory.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting child category:', error);
    return NextResponse.json({ error: 'Failed to delete child category' }, { status: 500 });
  }
}