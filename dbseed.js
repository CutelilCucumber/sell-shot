await prisma.marketplace.createMany({
  data: [
    { name: 'eBay',             slug: 'ebay',       type: 'API',      listingUrl: null },
    { name: 'Facebook',         slug: 'facebook',   type: 'TEMPLATE', listingUrl: 'https://www.facebook.com/marketplace/create/item' },
    { name: 'Mercari',          slug: 'mercari',    type: 'TEMPLATE', listingUrl: 'https://www.mercari.com/sell' },
    { name: 'Depop',            slug: 'depop',      type: 'API',      listingUrl: null },
    { name: 'OfferUp',          slug: 'offerup',    type: 'TEMPLATE', listingUrl: 'https://offerup.com/post' },
  ]
});