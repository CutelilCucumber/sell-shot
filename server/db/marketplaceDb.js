const prisma = require('./prismaClient');

async function getAllMarketplaces() {
  return prisma.marketplace.findMany({ orderBy: { name: 'asc' } });
}

async function getMarketplaceById(id) {
  return prisma.marketplace.findUnique({ where: { id } });
}

async function getMarketplaceBySlug(slug) {
  return prisma.marketplace.findUnique({ where: { slug } });
}

async function createMarketplace(name, slug) {
  return prisma.marketplace.create({ data: { name, slug } });
}

async function deleteMarketplace(id) {
  return prisma.marketplace.delete({ where: { id } });
}

module.exports = {
  getAllMarketplaces,
  getMarketplaceById,
  getMarketplaceBySlug,
  createMarketplace,
  deleteMarketplace
};