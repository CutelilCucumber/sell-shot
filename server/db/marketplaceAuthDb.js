const prisma = require('./prismaClient');

async function getUserMarketplaceAuth(userId, marketplaceId) {
  return prisma.userMarketplaceAuth.findUnique({
    where: {
      userId_marketplaceId: { userId, marketplaceId }
    },
    include: { marketplace: true }
  });
}

async function createUserMarketplaceAuth(userId, marketplaceId, tokens) {
  return prisma.userMarketplaceAuth.upsert({
    where: {
      userId_marketplaceId: { userId, marketplaceId }
    },
    update: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt
    },
    create: {
      userId,
      marketplaceId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt
    }
  });
}

async function deleteUserMarketplaceAuth(userId, marketplaceId) {
  return prisma.userMarketplaceAuth.delete({
    where: {
      userId_marketplaceId: { userId, marketplaceId }
    }
  });
}

async function getMarketplaceBySlug(slug) {
  return prisma.marketplace.findUnique({ where: { slug } });
}

module.exports = {
  getUserMarketplaceAuth,
  createUserMarketplaceAuth,
  deleteUserMarketplaceAuth,
  getMarketplaceBySlug
};