const express = require('express');
const router = express.Router();
const {upload, uploadFile, deleteFile} = require("../repos/files");
router.post('/',upload.single('image'), uploadFile);
router.delete('/', deleteFile);
module.exports = router;