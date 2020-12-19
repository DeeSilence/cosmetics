const express = require('express');
const router = express.Router();
const {addProduct, updateProduct, deleteProduct, getProduct, getAllProducts} = require('../repos/product')
router.post(`/`, addProduct);
router.put(`/`, updateProduct);
router.delete('/:puid', deleteProduct);
router.get(`/:puid`, getProduct);
router.get(`/`, getAllProducts);
module.exports = router;
