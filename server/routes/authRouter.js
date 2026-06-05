const { Router } = require('express');
const { verifyToken } = require('../middleware/auth');
const authRouter = Router();
const { 
  register,
  login,
  getMe
} = require('../controllers/authController');

// /auth

// { required body:
//     "username": "",
//     "email": "",
//     "password": ""
// }
authRouter.post('/register', register);

// {  required body:
//     "email": "",
//     "password": ""
// }
authRouter.post('/login', login);
authRouter.get('/me', verifyToken, getMe);

module.exports = authRouter;