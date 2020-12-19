const multer = require('multer');
const path = require('path')
const fs = require('fs')
// const productModel = require('../models/product')
const filter = (req, file, cb) => {
    if (req.userInfo && req.userInfo.isAdmin) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(null, false);
        }
    } else {

        req.error = {
            error: true,
            message: textTranslate.find('notAuthorized'),

        }
        cb(null, false)
    }
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, configs.imagesPath);
    },
    filename: (req, file, cb) => {
        const fileName = `${Date.now()}-${path.extname(file.originalname)}`
        req.filePath = `${configs.imagesPath}/${fileName}`
        cb(null, fileName)
    },
});
const upload = multer({storage: storage, fileFilter: filter});
const uploadFile = async (req, res, next) => {
    try {
        if (req.file) {
            // productModel.findOne({puid:req.body.puid}, function (err, userInfo) {
            //     if (err) {
            //           res.status(400).json({error: false, message: err});
            //     } else {
            //         if (userInfo) {
            //             const token = jwt.sign({id: userInfo._id}, configs.jwtSecretKey, {expiresIn: '24h'});
            //             res.status(400).json({
            //                 error: false,
            //                 message: textTranslate.find("userAlreadyExist"),
            //
            //             });
            //         }
            //     }
            // });
            return res.status(201).json({
                error: false,
                message: textTranslate.find('fileUploadedSuccessfully'),
                file: {
                    ...req.file,
                    filePath: req.filePath
                }
            });
        } else if (req.error) {
            return res.status(400).json({
                ...req.error

            });
        } else {
            return res.status(400).json({
                error: true,
                message: textTranslate.find('imageWasNotFound'),

            });
        }
    } catch
        (error) {
        return res.status(400).json({
            error: true,
            message: JSON.stringify(error)
        });
    }
}
const deleteFile = async (req, res, next) => {
    if (req.userInfo && req.userInfo.isAdmin) {
        if (!req.body.fileName) {
            return res.status(400).json({
                error: true,
                message: "fileName " + textTranslate.find('wasNotPassed')
            });
        }
        fs.unlink(configs.imagesPath + "/" + req.body.fileName, (err) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    message: JSON.stringify(err)
                });
            }

            return res.status(201).json({
                error: false,
                message: textTranslate.find('fileRemovedSuccessfully'),

            });
        })
    } else {
        return res.status(400).json({
            error: true,
            message: textTranslate.find('notAuthorized'),

        })
    }
}

module.exports = {uploadFile, deleteFile, upload}