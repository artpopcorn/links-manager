import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const COOKIE_NAME = 'admin-session';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Ищем пользователя в базе данных
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    // Создаем JWT токен
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Создаем ответ и устанавливаем HTTP-only cookie
    const response = NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      } 
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,     // Недоступно для JavaScript
      secure: process.env.NODE_ENV === 'production', // HTTPS в продакшене
      sameSite: 'strict', // Защита от CSRF
      maxAge: 24 * 60 * 60 * 1000, // 24 часа
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
