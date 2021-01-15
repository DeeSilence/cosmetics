const express = require('express');
const router = express.Router();
const {
    creteCart,
    addItemToCart,
    removeItemFromCart,
    deleteCart,
    getCart,
    getCarts,
    checkout,
    updateCartStatus,
    setAddress
} = require('../repos/cart')
router.post(`/`, creteCart);
router.post(`/item`, addItemToCart);
router.delete(`/item`, removeItemFromCart);
router.post(`/address`, setAddress);
router.delete('/:cuid', deleteCart);
router.post('/:cuid/status', updateCartStatus);
router.get(`/:cuid`, getCart);
router.get(`/`, getCarts);
router.post(`/checkout`, checkout);
module.exports = router;
