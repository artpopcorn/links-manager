import { NextResponse } from 'next/server';

const COOKIE_NAME = 'admin-session';

export async function POST() {
  try {
    // Создаем ответ
    const response = NextResponse.json({ success: true });

    // Очищаем cookie
    response.cookies.set(COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Устанавливаем время жизни 0 для удаления
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
