const {productModel} = require("../models/product")
const addProduct = (req, res, next) => {
    if (req.userInfo && req.userInfo.isAdmin === true) {
        const {
            name, category, originalPrice, salePrice, discount, quantity

        } = req.body
        let missingRequired = ''
        if (!name)
            missingRequired += 'name, '
        if (!category)
            missingRequired += 'category, '
        if (!originalPrice)
            missingRequired += 'originalPrice, '
        if (!salePrice)
            missingRequired += 'salePrice, '
        if (!discount)
            missingRequired += 'discount, '
        if (!quantity)
            missingRequired += 'quantity, '
        if (missingRequired.length > 0) {
            return res.status(400).json({
                error: true,
                message: missingRequired + textTranslate.find("wasNotPassed"),
            });
        }
        productModel.create({
            name, category, originalPrice, salePrice, discount, currency: configs.currency, quantity
        }, function (err, result) {
            if (err)
                res.status(400).json({error: false, message: err});
            else
                res.status(201).json({error: false, message: textTranslate.find("productAddedSuccessfully")});

        });
    } else {
        return res.status(400).json({
            error: true,
            message: textTranslate.find('notAuthorized'),

        })
    }
}
const updateProduct = (req, res, next) => {
    if (req.userInfo && req.userInfo.isAdmin === true) {
        const {
            puid, name, category, originalPrice, salePrice, discount, quantity
        } = req.body
        let missingRequired = ''
        if (!puid)
            missingRequired += 'puid, '
        if (missingRequired.length > 0) {
            return res.status(400).json({
                error: true,
                message: missingRequired + textTranslate.find("wasNotPassed"),
            });
        }
        productModel.findOne({puid}, function (err, product) {
            if (err) {
                res.status(400).json({error: false, message: err});
            } else {
                if (product) {
                    const toUpdate = {}

                    if (name)
                        toUpdate.name = name
                    if (category)
                        toUpdate.category = category
                    if (originalPrice)
                        toUpdate.originalPrice = originalPrice
                    if (salePrice || salePrice == null)
                        toUpdate.salePrice = salePrice
                    if (discount || discount == null)
                        toUpdate.discount = discount
                    if (quantity)
                        toUpdate.quantity = quantity
                    productModel.update({puid}, {...toUpdate}, function (err, updatedProduct) {
                        if (err) {
                            res.status(400).json({error: true, message: err});
                        } else {
                            res.status(201).json({
                                error: false,
                                message: textTranslate.find("productUpdatesSuccessfully"),
                                data: {}
                            });
                        }
                    });
                } else
                    res.status(404).json({
                        error: true,
                        message: textTranslate.find("productWasNotFound"),
                        data: {}
                    });
            }
        });
    } else {
        return res.status(400).json({
            error: true,
            message: textTranslate.find('notAuthorized'),

        })
    }
}
const deleteProduct = (req, res, next) => {
    if (req.userInfo && req.userInfo.isAdmin === true) {
        const {puid} = req.params
        let missingRequired = ''
        if (!puid)
            missingRequired += 'puid, '
        if (missingRequired.length > 0) {
            return res.status(400).json({
                error: true,
                message: missingRequired + textTranslate.find("wasNotPassed"),
            });
        }
        productModel.findOne({puid}, function (err, product) {
            if (err) {
                res.status(400).json({error: false, message: err});
            } else {
                if (product) {
                    productModel.deleteOne({puid}, function (err) {
                        if (err) {
                            res.status(400).json({error: true, message: err});
                        } else {
                            res.status(201).json({
                                error: false,
                                message: textTranslate.find("productDeletedSuccessfully"),
                                data: {}
                            });
                        }
                    });
                } else
                    res.status(404).json({
                        error: true,
                        message: textTranslate.find("productWasNotFound"),
                        data: {}
                    });
            }
        });

    } else {
        return res.status(400).json({
            error: true,
            message: textTranslate.find('notAuthorized'),

        })
    }
}
const getProduct = (req, res, next) => {
    const {puid} = req.params
    productModel.findOne({puid}, function (err, product) {
        if (err) {
            res.status(400).json({error: false, message: err});
        } else {
            if (product)
                res.status(201).json({
                    error: false,
                    message: textTranslate.find("productFound"),
                    data: {product: product['_doc']}
                });
            else
                res.status(404).json({
                    error: true,
                    message: textTranslate.find("productWasNotFound"),
                    data: {}
                });
        }
    });
}
const getAllProducts = (req, res, next) => {
    productModel.find({}, function (err, product) {
        if (err) {
            res.status(400).json({error: false, message: err});
        } else {
            res.status(201).json({
                error: false,
                message: textTranslate.find("productFound"),
                data: {products: product}
            });
        }
    });
}
module.exports = {addProduct, updateProduct, deleteProduct, getProduct, getAllProducts}