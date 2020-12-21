const express = require('express');
const router = express.Router();
const {
    addProduct, updateProduct, deleteProduct, getProduct, getAllProducts,
    addSKU, updateSKU, deleteSKU
} = require('../repos/product')
router.post(`/`, addProduct);
router.put(`/`, updateProduct);
router.delete('/:puid', deleteProduct);
router.get(`/:puid`, getProduct);
router.get(`/`, getAllProducts);

router.post(`/sku`, addSKU);
router.put(`/sku`, updateSKU);
router.delete('/sku/:puid/:skuid', deleteSKU);
module.exports = router;
