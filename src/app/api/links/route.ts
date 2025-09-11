import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { title, url } = await request.json()
    
    // Пока создадим тестового пользователя, если его нет
    let user = await prisma.user.findFirst()
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: 'test',
          name: 'Test User'
        }
      })
    }
    
    // Создаем ссылку
    const link = await prisma.link.create({
      data: {
        title,
        url,
        userId: user.id
      }
    })
    
    return NextResponse.json({ success: true, link })
  } catch (error) {
    console.error('Error creating link:', error)
    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const links = await prisma.link.findMany({
      include: {
        user: true
      }
    })
    return NextResponse.json({ links })
  } catch (error) {
    console.error('Error fetching links:', error)
    return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 })
  }
}