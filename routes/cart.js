const express = require('express');
const router = express.Router();
const {creteCart, updateItems, deleteCart, getCart, getCarts, checkout} = require('../repos/cart')
router.post(`/`, creteCart);
router.post(`/items`, updateItems);
router.delete('/:cuid', deleteCart);
router.get(`/:cuid`, getCart);
router.get(`/`, getCarts);
router.post(`/checkout`, checkout);
module.exports = router;
