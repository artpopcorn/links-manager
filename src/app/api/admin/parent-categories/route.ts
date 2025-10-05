import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { title, slug } = await request.json();
    
    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      );
    }

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

// Функция для обновления родительской категории (обрабатывает PUT-запросы)
export async function PUT(request: NextRequest) {
  try {
    const { id, title, slug, order } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Parent category ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (order !== undefined) updateData.order = order;
    
    const parentCategory = await prisma.parentCategory.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json({ success: true, parentCategory });
  } catch (error) {
    console.error('Error updating parent category:', error);
    return NextResponse.json({ error: 'Failed to update parent category' }, { status: 500 });
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