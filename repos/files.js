const multer = require('multer');
const path = require('path')
const fs = require('fs')
const {productModel} = require('../models/product')
const filter = (req, file, cb) => {
    if (req.userInfo && req.userInfo.isAdmin) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            req.file = file
            cb(null, true);
        } else {
            req.error = {
                error: true,
                message: textTranslate.find('unexpectedFormat'),

            }
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
    fileFilter: filter
});
const upload = multer({storage: storage, fileFilter: filter});
const uploadFile = async (req, res, next) => {
    try {
        if (req.file) {
            const {puid} = req.body
            const {uuid} = req.userInfo
            const {filename, originalname, encoding, mimetype, destination, size} = req.file
            const product = await productModel.findOne({puid}).exec()
            if (product) {
                const image = {
                    uuid,
                    puid,
                    filePath: req.filePath,
                    fileName: filename,
                    originalName: originalname,
                    encoding,
                    mimetype,
                    destination,
                    size
                }
                const images = product["_doc"].media.images
                // .map(k => k["_doc"])
                images.push(image)
                await product.save()
                return res.status(201).json({
                    error: false,
                    message: textTranslate.find('fileUploadedSuccessfully'),
                    data: {
                        product: product["_doc"]
                    }
                });
            } else {
                return res.status(404).json({
                    error: true,
                    message: textTranslate.find("productWasNotFound"),

                });
            }

        } else if (req.error) {
            return res.status(400).json({
                error: true,
                message: req.error

            });
        } else {
            return res.status(400).json({
                error: true,
                message: textTranslate.find('imageWasNotFound'),

            });
        }
    } catch (err) {
        return res.status(400).json({error: true, message: err});

    }
}
const deleteFile = async (req, res, next) => {
    if (req.userInfo && req.userInfo.isAdmin) {
        const {puid, fuid} = req.body
        let errorMsg = ""
        if (!puid) {
            errorMsg += "puid, "
        }
        if (!fuid) {
            errorMsg += "fuid, "
        }
        if (errorMsg.length > 0) {
            return res.status(400).json({
                error: true,
                message: errorMsg + " " + textTranslate.find('wasNotPassed')
            });
        }
        const product = await productModel.findOne({puid}).exec()
        const images = product["_doc"].media["_doc"].images

        const image = images.map(k => k["_doc"]).map(k => {
            return {
                ...k,
                fuid: JSON.stringify(k.fuid).replaceAll('"', "")
            }
        }).find(k => k.fuid === fuid)
        if (image) {
            images.pull(image._id)
            await product.save()
        } else {
            return res.status(400).json({
                error: true,
                message: textTranslate.find('fileWasNotFound'),

            })
        }
        fs.unlink(configs.imagesPath + "/" + image.fileName, async (err) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    message: JSON.stringify(err)
                });
            }
            return res.status(201).json({
                error: false,
                message: textTranslate.find('fileRemovedSuccessfully'),
                data: product
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