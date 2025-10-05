import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { title, parentId, slug } = await request.json();
    
    if (!title || !parentId || !slug) {
      return NextResponse.json(
        { error: 'Title, parentId and slug are required' },
        { status: 400 }
      );
    }

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

// Функция для обновления дочерней категории (обрабатывает PUT-запросы)
export async function PUT(request: NextRequest) {
  try {
    const { id, title, slug, order } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Child category ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (order !== undefined) updateData.order = order;
    
    const childCategory = await prisma.childCategory.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json({ success: true, childCategory });
  } catch (error) {
    console.error('Error updating child category:', error);
    return NextResponse.json({ error: 'Failed to update child category' }, { status: 500 });
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