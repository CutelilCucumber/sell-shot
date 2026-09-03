require('dotenv').config({ path: '../.env' });
const path = require('path');
const express = require("express");
const jwt = require('jsonwebtoken');
const cors = require('cors');

const authRouter = require('./routes/authRouter');
const itemRouter = require('./routes/itemRouter');
const imageRouter = require('./routes/imageRouter');
const listingRouter = require('./routes/listingRouter');
const listingsRouter = require('./routes/allListingsRouter');
const marketplaceRouter = require('./routes/marketplaceRouter');
const tagRouter = require('./routes/tagRouter');
const adminRouter = require('./routes/adminRouter');
const { verifyToken } = require('./middleware/auth');

const app = express();

const corsOrigin = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173'];
app.use(cors({ origin: corsOrigin }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/items', itemRouter);
app.use('/api/items/:itemId/images', imageRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/items/:itemId/listings', listingRouter);
app.use('/api/marketplaces', marketplaceRouter);
app.use('/api/tags', tagRouter);
app.use('/api/admin', adminRouter);

const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) next(err);
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).send(err.message);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {
    if (error) {
        throw error;
    }
    console.log(`listening on port ${PORT}`);
});