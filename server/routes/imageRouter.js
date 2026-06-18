const { Router } = require('express');
const imageRouter = Router({ mergeParams: true });
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
    getImages,
    addImages,
    setPrimary,
    deleteImage,
    identifyImage
} = require('../controllers/imageController');

imageRouter.get('/', verifyToken, getImages);
imageRouter.post('/', verifyToken, upload.array('images', 10), addImages);
imageRouter.put('/:imageId/primary', verifyToken, setPrimary);
imageRouter.put('/:imageId/identify', verifyToken, );
imageRouter.delete('/:imageId', verifyToken, deleteImage);

module.exports = imageRouter;