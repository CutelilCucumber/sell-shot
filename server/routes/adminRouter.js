const { Router } = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth');
const adminRouter = Router();
const { 
  getAllUsers,
  updateUserRole
} = require('../controllers/authController');

// /admin

adminRouter.get('/users', verifyToken, isAdmin, getAllUsers);

// {  required body:
//     "role": 'GUEST' | 'MEMBER' | 'ADMIN',
// } id passed by parameter
adminRouter.put('/users/:id/role', verifyToken, isAdmin, updateUserRole);

module.exports = adminRouter;