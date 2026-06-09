require('dotenv').config({ path: '../.env' });
const express = require("express");
const jwt = require('jsonwebtoken');
const cors = require('cors');

const authRouter = require('./routes/authRouter');
const itemRouter = require('./routes/itemRouter');
const imageRouter = require('./routes/imageRouter');
const listingRouter = require('./routes/listingRouter');
const marketplaceRouter = require('./routes/marketplaceRouter');
const tagRouter = require('./routes/tagRouter');
const adminRouter = require('./routes/adminRouter');

const app = express();

app.use(cors({ origin: ['http://localhost:5173'] }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/items', itemRouter);
app.use('/api/items/:itemId/images', imageRouter);
app.use('/api/items/:itemId/listings', listingRouter);
app.use('/api/marketplaces', marketplaceRouter);
app.use('/api/tags', tagRouter);
app.use('/api/admin', adminRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).send(err.message);
});

const PORT = 3000;
app.listen(PORT, (error) => {
    if (error) {
        throw error;
    }
    console.log(`listening on port ${PORT}`);
});