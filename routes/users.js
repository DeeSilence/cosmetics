const express = require('express');
const router = express.Router();
const userController = require('../repos/users');
const validateUser = require("../utils/validateUser");
router.post('/register', userController.create);
router.post('/login', userController.authenticate);
router.post('/address', validateUser,userController.addAddress);
router.put('/address', validateUser,userController.updateAddress);
router.delete('/address', validateUser,userController.deleteAddress);
router.get('/:uuid', validateUser, userController.getUser);
router.get('/', validateUser, userController.getUsers);
//TODO:add update profile and address
module.exports = router;