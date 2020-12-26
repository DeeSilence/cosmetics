const {productModel} = require("../models/product")
const addProduct = async (req, res, next) => {
    if (req.userInfo && req.userInfo.isAdmin === true) {
        const {
            name, category, description, originalPrice, salePrice, discount

        } = req.body
        let missingRequired = ''
        if (!name)
            missingRequired += 'name, '
        if (!category)
            missingRequired += 'category, '
        if (!description)
            missingRequired += 'description, '
        if (!originalPrice)
            missingRequired += 'originalPrice,'

        if (missingRequired.length > 0) {
            return res.status(400).json({
                error: true,
                message: missingRequired + textTranslate.find("wasNotPassed"),
            });
        }
        try {
            const product = await productModel.create({name, category, description, originalPrice, salePrice, discount})
            return res.status(201).json({
                error: false,
                message: textTranslate.find("productAddedSuccessfully"),
                data: product['_doc']
            });
        } catch (err) {
            return res.status(400).json({
                error: false,
                message: textTranslate.find("somethingWentWrong"),
                data: err
            });
        }

    } else {
        return res.status(400).json({
            error: true,
            message: textTranslate.find('notAuthorized'),

        })
    }
}
const updateProduct = async (req, res, next) => {
    if (req.userInfo && req.userInfo.isAdmin === true) {
        const {
            puid, name, category, description
        } = req.body
        let missingRequired = ''
        if (!puid)
            missingRequired += 'puid, '
        if (missingRequired.length > 0) {
            return
            return res.status(400).json({
                error: true,
                message: missingRequired + textTranslate.find("wasNotPassed"),
            });
        }
        try {
            const product = await productModel.findOne({puid}).exec()
            if (product) {
                const toUpdate = {}

                if (name)
                    toUpdate.name = name
                if (category)
                    toUpdate.category = category
                if (description)
                    toUpdate.description = description

                await productModel.update({puid}, {...toUpdate}).exec()
                const updatedProduct = await productModel.findOne({puid}).exec()
                return res.status(201).json({
                    error: false,
                    message: textTranslate.find("productUpdatesSuccessfully"),
                    data: updatedProduct['_doc']
                });
            } else
                return res.status(404).json({
                    error: true,
                    message: textTranslate.find("productWasNotFound"),
                    data: {}
                });
        } catch (err) {
            return res.status(400).json({
                error: false,
                message: textTranslate.find("somethingWentWrong"),
                data: err
            });
        }

    } else {
        return
        return res.status(400).json({
            error: true,
            message: textTranslate.find('notAuthorized'),

        })
    }
}
const deleteProduct = async (req, res, next) => {
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
        try {
            const product = await productModel.findOne({puid}).exec()
            if (product) {
                await productModel.deleteOne({puid}).exec()
                return res.status(201).json({
                    error: false,
                    message: textTranslate.find("productDeletedSuccessfully"),
                    data: {}
                });
            } else
                return res.status(404).json({
                    error: true,
                    message: textTranslate.find("productWasNotFound"),
                    data: {}
                });
        } catch (err) {
            return res.status(400).json({
                error: false, message: textTranslate.find("somethingWentWrong"),
                data: err
            });
        }

    } else {
        return res.status(400).json({
            error: true,
            message: textTranslate.find('notAuthorized'),

        })
    }
}
const getProduct = async (req, res, next) => {
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
    try {
        const product = await productModel.findOne({puid}).exec();
        if (product)
            return res.status(201).json({
                error: false,
                message: textTranslate.find("productFound"),
                data: {product: product['_doc']}
            });
        else
            return res.status(404).json({
                error: true,
                message: textTranslate.find("productWasNotFound"),
                data: {}
            });
    } catch (err) {
        return res.status(400).json({
            error: false, message: textTranslate.find("productWasNotFound"),
            data: err
        });
    }

}
const getAllProducts = async (req, res, next) => {
    try {
        const products = await productModel.find({}).exec();
        return res.status(201).json({
            error: false,
            message: textTranslate.find("productFound"),
            data: {products}
        });

    } catch (err) {
        return res.status(400).json({
            error: false, message: textTranslate.find("somethingWentWrong"),
            data: err
        });
    }
}


const addSKU = async (req, res, next) => {
    if (req.userInfo && req.userInfo.isAdmin === true) {
        const {
            puid, name, description, originalPrice, salePrice, discount, quantity
        } = req.body
        let missingRequired = ''
        if (!puid)
            missingRequired += 'puid, '
        if (!name)
            missingRequired += 'name, '
        if (!description)
            missingRequired += 'description, '
        if (!originalPrice)
            missingRequired += 'originalPrice, '
        if (!quantity)
            missingRequired += 'quantity, '

        if (missingRequired.length > 0) {
            return res.status(400).json({
                error: true,
                message: missingRequired + textTranslate.find("wasNotPassed"),
            });
        }
        try {
            const product = await productModel.findOne({puid}).exec();
            if (product) {
                product['_doc'].skus.push({puid, name, description, originalPrice, salePrice, discount, quantity})
                await product.save()
                let totalQuantity = 0;
                product['_doc'].skus.forEach(item => {
                    totalQuantity += item.quantity
                })
                await productModel.update({puid}, {quantity: totalQuantity}).exec()
                const updatedProduct = await productModel.findOne({puid}).exec()
                return res.status(201).json({
                    error: false,
                    message: textTranslate.find("skuAddedSuccessfully"),
                    data: updatedProduct['_doc']
                });
            } else
                return res.status(404).json({
                    error: true,
                    message: textTranslate.find("skuWasNotFound"),
                    data: {}
                });
        } catch (err) {
            return res.status(400).json({
                error: false, message: textTranslate.find("somethingWentWrong"),
                data: err
            });
        }

    } else {
        return res.status(400).json({
            error: true,
            message: textTranslate.find('notAuthorized'),

        })
    }
}
const updateSKU = async (req, res, next) => {
    if (req.userInfo && req.userInfo.isAdmin === true) {
        const {
            puid, skuid, name, description, originalPrice, salePrice, discount, quantity
        } = req.body
        let missingRequired = ''
        if (!puid)
            missingRequired += 'puid, '
        if (!skuid)
            missingRequired += 'skuid, '
        if (missingRequired.length > 0) {
            return res.status(400).json({
                error: true,
                message: missingRequired + textTranslate.find("wasNotPassed"),
            });
        }
        try {
            const product = await productModel.findOne({puid}).exec()
            if (product) {
                const sku = product['_doc'].skus.map(k => {
                    return {
                        ...k,
                        skuid: JSON.stringify(k.skuid).replaceAll('"', "")
                    }
                }).find(item => item.skuid === skuid)
                if (sku) {
                    product['_doc'].skus.pull(sku['_doc']._id)
                    product['_doc'].skus.push({name, description, originalPrice, salePrice, discount, quantity})
                    await product.save()
                    let totalQuantity = 0;
                    product['_doc'].skus.forEach(item => {
                        totalQuantity += item.quantity
                    })
                    await productModel.update({puid}, {quantity: totalQuantity}).exec()
                    const updatedProduct = await productModel.findOne({puid}).exec()
                    return res.status(201).json({
                        error: false,
                        message: textTranslate.find("skuUpdatesSuccessfully"),
                        data: updatedProduct['_doc']
                    });
                } else
                    return res.status(404).json({
                        error: true,
                        message: textTranslate.find("skuWasNotFound"),
                        data: {}
                    });
            } else
                return res.status(404).json({
                    error: true,
                    message: textTranslate.find("productWasNotFound"),
                    data: {}
                });
        } catch (err) {
            return res.status(400).json({
                error: false, message: textTranslate.find("somethingWentWrong"),
                data: err
            });
        }

    } else {
        return res.status(400).json({
            error: true,
            message: textTranslate.find('notAuthorized'),

        })
    }
}
const deleteSKU = async (req, res, next) => {
    if (req.userInfo && req.userInfo.isAdmin === true) {
        const {puid, skuid} = req.params
        let missingRequired = ''
        if (!puid)
            missingRequired += 'puid, '
        if (!skuid)
            missingRequired += 'skuid, '
        if (missingRequired.length > 0) {
            return
            return res.status(400).json({
                error: true,
                message: missingRequired + textTranslate.find("wasNotPassed"),
            });
        }
        try {
            const product = await productModel.findOne({puid}).exec()
            if (product) {
                const sku = product['_doc'].skus.map(k => {
                    return {
                        ...k,
                        skuid: JSON.stringify(k.skuid).replaceAll('"', "")
                    }
                }).find(item => item.skuid === skuid)
                if (sku) {
                    product['_doc'].skus.pull(sku['_doc']._id)
                    await product.save()
                    let totalQuantity = 0;
                    product['_doc'].skus.forEach(item => {
                        totalQuantity += item.quantity
                    })
                    await productModel.update({puid}, {quantity: totalQuantity}).exec()
                    const updatedProduct = await productModel.findOne({puid}).exec()
                    return res.status(201).json({
                        error: false,
                        message: textTranslate.find("skuDeletedSuccessfully"),
                        data: updatedProduct['_doc']
                    });
                } else
                    return res.status(404).json({
                        error: true,
                        message: textTranslate.find("skuWasNotFound"),
                        data: {}
                    });
            } else
                return res.status(404).json({
                    error: true,
                    message: textTranslate.find("productWasNotFound"),
                    data: {}
                });
        } catch (err) {
            return res.status(400).json({
                error: false, message: textTranslate.find("somethingWentWrong"),
                data: err
            });
        }

    } else {
        return res.status(400).json({
            error: true,
            message: textTranslate.find('notAuthorized'),

        })
    }
}

module.exports = {
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    getAllProducts,
    addSKU,
    updateSKU,
    deleteSKU
}