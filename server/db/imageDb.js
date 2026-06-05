const prisma = require('./prismaClient');

async function addImage(itemId, { url, fileName, isPrimary }) {
  // if this is primary, clear existing primary first
  if (isPrimary) {
    await prisma.image.updateMany({
      where: { itemId },
      data: { isPrimary: false }
    });
  }
  return prisma.image.create({
    data: { itemId, url, fileName, isPrimary: isPrimary || false }
  });
}

async function setPrimaryImage(id, itemId) {
  await prisma.image.updateMany({
    where: { itemId },
    data: { isPrimary: false }
  });
  return prisma.image.update({
    where: { id },
    data: { isPrimary: true }
  });
}

async function deleteImage(id) {
  return prisma.image.delete({ where: { id } });
}

async function getImagesByItem(itemId) {
  return prisma.image.findMany({
    where: { itemId },
    orderBy: { isPrimary: 'desc' }
  });
}

module.exports = {
  addImage,
  setPrimaryImage,
  deleteImage,
  getImagesByItem
};