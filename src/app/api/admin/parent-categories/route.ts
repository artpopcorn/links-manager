import { NextResponse } from 'next/server';
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