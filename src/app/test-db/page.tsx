import { prisma } from '@/lib/db'

export default async function TestDB() {
  // Попробуем подключиться к БД и получить информацию
  try {
    const userCount = await prisma.user.count()
    const linkCount = await prisma.link.count()
    
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Тест подключения к БД</h1>
        <div className="space-y-2">
          <p>Пользователей в БД: {userCount}</p>
          <p>Ссылок в БД: {linkCount}</p>
          <p className="text-green-600">Подключение к PostgreSQL работает!</p>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Ошибка подключения к БД</h1>
        <p className="text-red-600">Ошибка: {String(error)}</p>
      </div>
    )
  }
}