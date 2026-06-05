const { Router } = require('express');
const listingRouter = Router({ mergeParams: true });
const { verifyToken } = require('../middleware/auth');
const {
    getListings,
    getListing,
    createListing,
    updateListing,
    updateStatus,
    deleteListing
} = require('../controllers/listingController');

listingRouter.get('/', verifyToken, getListings);
listingRouter.get('/:listingId', verifyToken, getListing);
listingRouter.post('/', verifyToken, createListing);
listingRouter.put('/:listingId', verifyToken, updateListing);
listingRouter.put('/:listingId/status', verifyToken, updateStatus);
listingRouter.delete('/:listingId', verifyToken, deleteListing);

module.exports = listingRouter;