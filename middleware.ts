import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const COOKIE_NAME = 'admin-session';

export function middleware(request: NextRequest) {
  // Проверяем только админские роуты
  if (request.nextUrl.pathname.startsWith('/api/admin') || 
      request.nextUrl.pathname.startsWith('/admin')) {
    
    // Исключаем страницу логина и API авторизации
    if (request.nextUrl.pathname === '/admin' ||
        request.nextUrl.pathname.startsWith('/api/auth')) {
      return NextResponse.next();
    }

    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      // Если это API роут - возвращаем 401
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      // Если это страница - редирект на логин
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    try {
      // Проверяем валидность токена
      jwt.verify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      console.error('Token verification failed:', error);
      
      // Очищаем невалидный cookie
      const response = request.nextUrl.pathname.startsWith('/api/')
        ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        : NextResponse.redirect(new URL('/admin', request.url));
      
      response.cookies.set(COOKIE_NAME, '', {
        maxAge: 0,
        path: '/'
      });
      
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
};
