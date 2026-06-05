const { Router } = require('express');
const tagRouter = Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const {
    getTags,
    deleteTag
} = require('../controllers/tagController');

tagRouter.get('/', verifyToken, getTags);
tagRouter.delete('/:id', verifyToken, isAdmin, deleteTag);

module.exports = tagRouter;