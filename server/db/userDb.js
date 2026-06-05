const prisma = require('./prismaClient');

async function getAllUsers() {
  return prisma.user.findMany({
    orderBy: { created: 'desc' },
  });
}

async function getUserByUsername(username) {
  return prisma.user.findUnique({ where: { username } });
}

async function getUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, username: true, email: true, role: true, createdAt: true }
  });
}

async function createUser(username, email, hash, salt) {
  const user = await prisma.user.create({
    data: { username, email, hash, salt }
  });
  return user;
}

async function updateUserRole(id, role) {
  return prisma.user.update({
    where: { id },
    data: { role }
  });
}

module.exports = { 
  getAllUsers,
  getUserByEmail, 
  getUserByUsername, 
  getUserById, 
  createUser,
  updateUserRole
};