const express = require('express');
const router = express.Router();
const bankRoutes = require('./v1/bankRoutes');
const chatRoutes = require('./v1/chatRoutes');
const lessonRoutes = require('./v1/lessonRoutes');
const clientRoutes = require('./v1/clientRoutes');
const productRoutes = require('./v1/productRoutes');

router.use('/bank', bankRoutes);
router.use('/chat', chatRoutes);
router.use('/lesson', lessonRoutes);
router.use('/client', clientRoutes);
router.use('/products', productRoutes);

module.exports = versionString => ({
  private: require(`./${versionString}/privateRoutes`),
  public: require(`./${versionString}/publicRoutes`),
  router
});
