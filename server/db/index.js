module.exports = {
  ...require('./userDb'),
  ...require('./itemDb'),
  ...require('./imageDb'),
  ...require('./listingDb'),
  ...require('./marketplaceDb'),
  ...require('./tagDb'),
  ...require('./marketplaceAuthDb')
};