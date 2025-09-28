import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const parentCategories = await prisma.parentCategory.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        childCategories: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            links: {
              where: { isActive: true },
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    return NextResponse.json({ categories: parentCategories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}