const { Router } = require('express');
const itemRouter = Router();
const { verifyToken, isMember } = require('../middleware/auth');
const {
    getItems,
    getItem,
    createItem,
    updateItem,
    deleteItem,
    identifyImage
} = require('../controllers/itemController');

itemRouter.get('/', verifyToken, getItems);
itemRouter.get('/:id', verifyToken, getItem);
itemRouter.post('/', verifyToken, createItem);
itemRouter.put('/:id', verifyToken, updateItem);
itemRouter.delete('/:id', verifyToken, deleteItem);
itemRouter.post('/:id/identify', verifyToken, identifyImage);

module.exports = itemRouter;