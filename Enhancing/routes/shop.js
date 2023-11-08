const express = require('express');

const shopsController = require('../controllers/shop');

const router = express.Router();

router.get('/', shopsController.getIndex);
router.get('/products',shopsController.getProducts);
router.get('/cart', shopsController.getCart);
router.get('/checkout', shopsController.getCheckout);
router.get('/orders', shopsController.getOrders);

module.exports = router;
