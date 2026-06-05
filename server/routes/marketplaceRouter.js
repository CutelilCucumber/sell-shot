const { Router } = require('express');
const marketplaceRouter = Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const {
    getMarketplaces,
    getMarketplace,
    createMarketplace,
    deleteMarketplace
} = require('../controllers/marketplaceController');

marketplaceRouter.get('/', getMarketplaces);
marketplaceRouter.get('/:id', getMarketplace);
marketplaceRouter.post('/', verifyToken, isAdmin, createMarketplace);
marketplaceRouter.delete('/:id', verifyToken, isAdmin, deleteMarketplace);

module.exports = marketplaceRouter;