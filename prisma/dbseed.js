require('dotenv').config();
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const marketplaces = [
    { name: 'Facebook Marketplace', slug: 'facebook', type: 'TEMPLATE', listingUrl: 'https://www.facebook.com/marketplace/create/item' },
    { name: 'Mercari',              slug: 'mercari',  type: 'TEMPLATE', listingUrl: 'https://www.mercari.com/sell' },
    { name: 'OfferUp',              slug: 'offerup',  type: 'TEMPLATE', listingUrl: 'https://offerup.com/post' },
    { name: 'Depop',                slug: 'depop',    type: 'API',      listingUrl: 'https://www.depop.com/sell/' },
    { name: 'eBay',                 slug: 'ebay',     type: 'API',      listingUrl: null },
    { name: 'Poshmark',             slug: 'poshmark', type: 'API',      listingUrl: null },
    { name: 'Etsy',                 slug: 'etsy',     type: 'API',      listingUrl: null },
  ];

  for (const mp of marketplaces) {
    await prisma.marketplace.upsert({
      where: { slug: mp.slug },
      update: { name: mp.name, type: mp.type, listingUrl: mp.listingUrl },
      create: mp,
    });
    console.log('seeded:', mp.name);
  }

  console.log('done');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());