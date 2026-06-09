const { Router } = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth');
const adminRouter = Router();
const { 
    getUsers, 
    updateRole, 
    deleteItem, 
    deleteListing 
} = require('../controllers/adminController');

adminRouter.use(verifyToken, isAdmin);

adminRouter.get('/users', getUsers);
adminRouter.put('/users/:id/role', updateRole);
adminRouter.delete('/items/:id', deleteItem);
adminRouter.delete('/listings/:id', deleteListing);

module.exports = adminRouter;