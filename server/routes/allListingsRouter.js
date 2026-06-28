const { Router } = require('express');
const listingsRouter = Router({ mergeParams: true });
const { verifyToken } = require('../middleware/auth');
const {
    getAllListings
} = require('../controllers/listingController');

listingsRouter.get('/', verifyToken, getAllListings);

module.exports = listingsRouter;