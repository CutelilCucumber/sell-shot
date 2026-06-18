const prisma = require('./prismaClient');

async function getItemsByUser(authorId) {
  return prisma.item.findMany({
    where: { authorId },
    orderBy: { createdAt: 'desc' },
    include: {
      images: { orderBy: { isPrimary: 'desc' } },
      tags: { include: { tag: true } },
      listings: { include: { marketplace: true } }
    }
  });
}

async function getItemById(id) {
  return prisma.item.findUnique({
    where: { id },
    include: {
      images: { orderBy: { isPrimary: 'desc' } },
      tags: { include: { tag: true } },
      listings: {
        include: { marketplace: true },
        orderBy: { createdAt: 'desc' }
      },
      author: { select: { id: true, username: true } }
    }
  });
}

async function createItem(authorId, data) {
  const { title, description, brand, category, size, color, condition, estimatedPrice } = data;
  return prisma.item.create({
    data: { authorId, title, description, brand, category, size, color, condition, estimatedPrice }
  });
}

async function updateItem(id, data) {
  const { title, description, brand, category, size, color, material, condition, estimatedPrice, aiIdentified, aiData } = data;
  return prisma.item.update({
    where: { id },
    data: { title, description, brand, category, size, color, material, condition, estimatedPrice, aiIdentified, aiData }
  });
}

async function deleteItem(id) {
  return prisma.item.delete({ where: { id } });
}

async function upsertItemTags(itemId, tagNames) {
  // full replace, wipe and re-insert tags
  await prisma.itemTag.deleteMany({ where: { itemId } });

  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { name: name.toLowerCase().trim() },
      update: {},
      create: { name: name.toLowerCase().trim() }
    });
    await prisma.itemTag.create({ data: { itemId, tagId: tag.id } });
  }

  // clean up orphaned tags
  await prisma.tag.deleteMany({ where: { items: { none: {} } } });
}

module.exports = {
  getItemsByUser,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  upsertItemTags
};