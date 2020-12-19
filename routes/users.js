const express = require('express');
const router = express.Router();
const userController = require('../repos/users');
router.post('/register', userController.create);
router.post('/login', userController.authenticate);
router.post('/product', userController.authenticate);

module.exports = router;