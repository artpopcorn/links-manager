const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Проверяем, есть ли уже админ
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Хешируем пароль
    const passwordHash = await bcrypt.hash('admin123', 12);

    // Создаем админа
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        passwordHash: passwordHash,
        role: 'admin'
      }
    });

    console.log('Admin user created successfully:', {
      id: admin.id,
      username: admin.username,
      role: admin.role
    });

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
