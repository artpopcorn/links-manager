// Функции для работы с авторизацией

export const checkAuth = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include', // Включаем cookies
    });

    return response.ok;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
};

export const logout = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include', // Включаем cookies
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const getCurrentUser = async () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      return data.user;
    }
    
    return null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};
