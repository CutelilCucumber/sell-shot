const { Router } = require('express');
const itemRouter = Router();
const { verifyToken, isMember } = require('../middleware/auth');
const {
    getItems,
    getItem,
    createItem,
    updateItem,
    deleteItem
} = require('../controllers/itemController');

itemRouter.get('/', verifyToken, getItems);
itemRouter.get('/:id', verifyToken, getItem);
itemRouter.post('/', verifyToken, createItem);
itemRouter.put('/:id', verifyToken, updateItem);
itemRouter.delete('/:id', verifyToken, deleteItem);

module.exports = itemRouter;