const prisma = require('./prismaClient');

async function getListingsByItem(itemId) {
  return prisma.listing.findMany({
    where: { itemId },
    include: { marketplace: true },
    orderBy: { createdAt: 'desc' }
  });
}

async function getListingById(id) {
  return prisma.listing.findUnique({
    where: { id },
    include: { marketplace: true, item: true }
  });
}

async function createListing(itemId, { marketplaceId, title, description, listingPrice }) {
  return prisma.listing.create({
    data: { itemId, marketplaceId, title, description, listingPrice }
  });
}

async function updateListing(id, data) {
  const { title, description, listingPrice, status, externalId, listedAt, soldAt } = data;
  return prisma.listing.update({
    where: { id },
    data: { title, description, listingPrice, status, externalId, listedAt, soldAt }
  });
}

// seperate status function to control listedAt and soldAt side effects
async function updateListingStatus(id, status) {
  const data = { status };
  if (status === 'ACTIVE') data.listedAt = new Date();
  if (status === 'SOLD') data.soldAt = new Date();
  return prisma.listing.update({ where: { id }, data });
}

async function deleteListing(id) {
  return prisma.listing.delete({ where: { id } });
}

module.exports = {
  getListingsByItem,
  getListingById,
  createListing,
  updateListing,
  updateListingStatus,
  deleteListing
};