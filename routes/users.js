const express = require('express');
const router = express.Router();
const userController = require('../repos/users');
router.post('/register', userController.create);
router.post('/login', userController.authenticate);
router.get('users/:uuid', userController.getUser);
router.get('users/', userController.getUsers);

module.exports = router;