const cartModel = require("../models/cart")
const {productModel} = require("../models/product")
const moment = require('moment')
const _ = require('lodash')
const creteCart = async (req, res, next) => {
    const {uuid} = req.userInfo
    try {
        const cart = await cartModel.findOne({uuid, status: configs.cartStatus.inProgress}).exec()
        if (cart) {
            return res.status(201).json({
                error: false,
                message: textTranslate.find("userAlreadyHaveCart"),
                data: cart["_doc"]
            });
        } else {
            const total = '0'
            const createDate = moment(new Date()).format("DD/MM/YYYY")
            const currency = configs.currency

            const createdCart = await cartModel.create({uuid, total, createDate, currency,})
            return res.status(201).json({
                error: false,
                message: textTranslate.find("cartCreatedSuccessfully"),
                data: createdCart["_doc"]
            });
        }

    } catch (err) {
        return res.status(400).json({error: true, message: err});
    }

}
const addItemToCart = async (req, res, next) => {
    const {uuid} = req.userInfo
    const {
        cuid,
        puid,
        skuid,
        quantity
    } = req.body
    let missingRequired = ''
    if (!cuid)
        missingRequired += 'cuid, '
    if (!puid)
        missingRequired += 'puid, '
    if (!skuid)
        missingRequired += 'skuid, '
    if (!quantity)
        missingRequired += 'quantity, '

    if (missingRequired.length > 0) {
        return res.status(400).json({
            error: true,
            message: missingRequired + textTranslate.find("wasNotPassed"),
        });
    }
    try {
        // find cart
        const cart = await cartModel.findOne({cuid, uuid, status: configs.cartStatus.inProgress}).exec()
        if (!cart)
            return res.status(404).json({
                error: true,
                message: textTranslate.find("cartWasNotFound"),
                data: {}
            });

        const currentCartItems = cart['_doc'].items.map(i => i["_doc"]).map(k => {
            return {
                ...k,
                _id: JSON.stringify(k._id).replaceAll('"', ""),
                puid: JSON.stringify(k.puid).replaceAll('"', ""),
                skuid: JSON.stringify(k.skuid).replaceAll('"', ""),
            }
        })
        // find puid and skuid
        const product = await productModel.findOne({puid}).exec()
        if (!product)
            return res.status(404).json({
                error: true,
                message: `puid ` + puid + textTranslate.find("notValid"),
                data: {}
            });

        const productSkus = product['_doc'].skus
        if (!productSkus)
            return res.status(404).json({
                error: true,
                message: textTranslate.find("noSkuAddedFor") + puid,
                data: {}
            });
        const selectedSku = productSkus.map(k => k['_doc']).map(k => {
            return {
                ...k,
                skuid: JSON.stringify(k.skuid).replaceAll('"', ""),
                _id: JSON.stringify(k._id).replaceAll('"', ""),
            }
        }).find(k => k.skuid === skuid)
        if (!selectedSku)
            return res.status(404).json({
                error: true,
                message: `skuid ` + skuid + textTranslate.find("notValid"),
                data: {}
            });
        //update cart and product
        if (!(selectedSku.quantity >= quantity))
            return res.status(404).json({
                error: true,
                message: product['_doc'].name + " with id " + product['_doc'].puid + " and skuID " + selectedSku.skuid + " only (" + selectedSku.quantity + ") items in stock",
                data: {}
            });
        const cartItem = currentCartItems.find(item => item.skuid === skuid)
        if (cartItem) {
            cartItem.quantity += Math.abs(Math.round(quantity))
            cart['_doc'].items.pull(cartItem._id)
            cart['_doc'].items.push(cartItem)
            await cart.save()
        } else {
            const newItem = {}
            newItem.quantity = Math.abs(Math.round(quantity))
            newItem.puid = puid
            newItem.skuid = skuid
            newItem.product = product['_doc']
            cart['_doc'].items.push(newItem)
            await cart.save()
        }
        selectedSku.quantity -= quantity
        product['_doc'].skus.pull(selectedSku._id)
        product['_doc'].skus.push(selectedSku)
        await product.save()
        let totalQuantity = 0;
        product['_doc'].skus.forEach(item => {
            totalQuantity += item.quantity
        })
        let total = 0
        cart['_doc'].items.forEach((a) => {
            let skuIndex = null
            a.product.skus.map(k => k['_doc']).map(k => {
                return {
                    ...k,
                    skuid: JSON.stringify(k.skuid).replaceAll('"', ""),
                    _id: JSON.stringify(k._id).replaceAll('"', ""),
                }
            }).forEach((k, ik) => {
                if (k.skuid === a.skuid) {
                    skuIndex = ik
                    return k
                }
            })
            total += (parseFloat(a.product.skus[skuIndex].salePrice || a.product.skus[skuIndex].originalPrice) * a.quantity)
        })
        await productModel.update({puid}, {quantity: totalQuantity}).exec()
        await cartModel.update({cuid}, {total}).exec()
        const updatedCart = await cartModel.findOne({cuid}).exec()
        return res.status(201).json({
            error: false,
            message: textTranslate.find("cartUpdatesSuccessfully"),
            data: {
                cart: updatedCart["_doc"]
            }
        });
    } catch (err) {
        return res.status(400).json({error: true, message: err});
    }
}
const removeItemFromCart = async (req, res, next) => {
    const {uuid} = req.userInfo
    const {
        cuid,
        puid,
        skuid,
        quantity
    } = req.body
    let missingRequired = ''
    if (!cuid)
        missingRequired += 'cuid, '
    if (!puid)
        missingRequired += 'puid, '
    if (!skuid)
        missingRequired += 'skuid, '
    if (!quantity)
        missingRequired += 'quantity, '

    if (missingRequired.length > 0) {
        return res.status(400).json({
            error: true,
            message: missingRequired + textTranslate.find("wasNotPassed"),
        });
    }
    try {
        // find cart
        const cart = await cartModel.findOne({cuid, uuid, status: configs.cartStatus.inProgress}).exec()
        if (!cart)
            return res.status(404).json({
                error: true,
                message: textTranslate.find("cartWasNotFound"),
                data: {}
            });

        const currentCartItems = cart['_doc'].items.map(i => i["_doc"]).map(k => {
            return {
                ...k,
                _id: JSON.stringify(k._id).replaceAll('"', ""),
                puid: JSON.stringify(k.puid).replaceAll('"', ""),
                skuid: JSON.stringify(k.skuid).replaceAll('"', ""),
            }
        })
        // find puid and skuid
        const product = await productModel.findOne({puid}).exec()
        if (!product)
            return res.status(404).json({
                error: true,
                message: `puid ` + puid + textTranslate.find("notValid"),
                data: {}
            });

        const productSkus = product['_doc'].skus
        if (!productSkus)
            return res.status(404).json({
                error: true,
                message: textTranslate.find("noSkuAddedFor") + puid,
                data: {}
            });
        const selectedSku = productSkus.map(k => k['_doc']).map(k => {
            return {
                ...k,
                skuid: JSON.stringify(k.skuid).replaceAll('"', ""),
                _id: JSON.stringify(k._id).replaceAll('"', ""),
            }
        }).find(k => k.skuid === skuid)
        if (!selectedSku)
            return res.status(404).json({
                error: true,
                message: `skuid ` + skuid + textTranslate.find("notValid"),
                data: {}
            });
        //update cart and product
        const cartItem = currentCartItems.find(item => item.skuid === skuid)
        if (!(cartItem.quantity >= quantity))
            return res.status(404).json({
                error: true,
                message: product['_doc'].name + " with id " + product['_doc'].puid + " and skuID " + selectedSku.skuid + " only (" + cartItem.quantity + ") items in cart",
                data: {}
            });

        if (!cartItem)
            return res.status(404).json({
                error: true,
                message: product['_doc'].name + " with id " + product['_doc'].puid + " and skuID " + selectedSku.skuid + " not in cart",
                data: {}
            });

        cartItem.quantity -= Math.abs(Math.round(quantity))
        cart['_doc'].items.pull(cartItem._id)
        if (cartItem.quantity !== 0)
            cart['_doc'].items.push(cartItem)

        await cart.save()

        selectedSku.quantity += quantity
        product['_doc'].skus.pull(selectedSku._id)
        product['_doc'].skus.push(selectedSku)
        await product.save()
        let totalQuantity = 0;
        product['_doc'].skus.forEach(item => {
            totalQuantity += item.quantity
        })
        let total = 0
        cart['_doc'].items.forEach((a) => {
            let skuIndex = null
            a.product.skus.map(k => k['_doc']).map(k => {
                return {
                    ...k,
                    skuid: JSON.stringify(k.skuid).replaceAll('"', ""),
                    _id: JSON.stringify(k._id).replaceAll('"', ""),
                }
            }).forEach((k, ik) => {
                if (k.skuid === a.skuid) {
                    skuIndex = ik
                    return k
                }
            })
            total += (parseFloat(a.product.skus[skuIndex].salePrice || a.product.skus[skuIndex].originalPrice) * a.quantity)
        })
        await productModel.update({puid}, {quantity: totalQuantity}).exec()
        await cartModel.update({cuid}, {total}).exec()
        const updatedCart = await cartModel.findOne({cuid}).exec()
        return res.status(201).json({
            error: false,
            message: textTranslate.find("cartUpdatesSuccessfully"),
            data: {
                cart: updatedCart["_doc"]
            }
        });
    } catch (err) {
        return res.status(400).json({error: true, message: err});
    }
}
const updateCartStatus = async (req, res, next) => {
    const {cuid} = req.params
    const {notes, status} = req.body
    const {isAdmin} = req.userInfo
    if (!isAdmin)
        return res.status(400).json({
            error: true,
            message: textTranslate.find('notAuthorized'),

        })
    try {
        let missingRequired = ''
        if (!status || !Object.keys(configs.cartStatus).find(key => configs.cartStatus[key] === status))
            missingRequired += 'status, '
        if (missingRequired.length > 0) {
            return res.status(400).json({
                error: true,
                message: missingRequired + textTranslate.find("wasNotPassed"),
            });
        }
        const cart = await cartModel.findOne({cuid}).exec()
        if (!cart)
            return res.status(404).json({
                error: true,
                message: textTranslate.find("cartWasNotFound"),
                data: {}
            });
        await cartModel.update({cuid}, {status, notes}).exec()
        const updatedCart = await cartModel.findOne({cuid}).exec()
        return res.status(201).json({
            error: false,
            message: textTranslate.find("cartUpdatesSuccessfully"),
            data: updatedCart['_doc']
        });

    } catch (err) {
        return res.status(400).json({error: true, message: err});
    }
}
const setAddress = async (req, res, next) => {
    const {latitude, longitude, addressDescription, cuid} = req.body
    const {uuid} = req.userInfo
    let missingRequired = ''
    if (!cuid)
        missingRequired += 'cuid, '
    if (longitude && !latitude)
        missingRequired += 'latitude, '
    if (!longitude && latitude)
        missingRequired += 'longitude, '
    if (!addressDescription && !latitude && longitude)
        missingRequired += 'addressDescription, '
    if (missingRequired.length > 0) {
        return res.status(400).json({
            error: true,
            message: missingRequired + textTranslate.find("wasNotPassed"),
        });
    }
    try {
        const cart = await cartModel.findOne({cuid, uuid}).exec()
        if (!cart)
            return res.status(404).json({
                error: true,
                message: textTranslate.find("cartWasNotFound"),
                data: {}
            });
        const shippingAddress = {latitude, longitude, addressDescription}
        await cartModel.update({cuid, uuid}, {shippingAddress}).exec()
        const updatedCart = await cartModel.findOne({cuid, uuid}).exec()
        return res.status(201).json({
            error: false,
            message: textTranslate.find("cartUpdatesSuccessfully"),
            data: updatedCart['_doc']
        });

    } catch (err) {
        return res.status(400).json({error: true, message: err});
    }
}
const deleteCart = (req, res, next) => {
    const {uuid} = req.userInfo
    const {cuid} = req.params
    let missingRequired = ''
    if (!cuid)
        missingRequired += 'cuid, '
    if (missingRequired.length > 0) {
        return res.status(400).json({
            error: true,
            message: missingRequired + textTranslate.find("wasNotPassed"),
        });
    }
    cartModel.findOne({uuid, cuid}, function (err, cart) {
        if (err) {
            return res.status(400).json({error: true, message: err});
        } else {
            if (cart) {
                cartModel.deleteOne({_id: cart["_doc"]["_id"]}, function (err) {
                    if (err) {
                        return res.status(400).json({error: true, message: err});
                    } else {
                        return res.status(201).json({
                            error: false,
                            message: textTranslate.find("cartDeletedSuccessfully"),
                            data: {}
                        });
                    }
                });
            } else
                return res.status(400).json({
                    error: false,
                    message: textTranslate.find("cartWasNotFound"),
                    data: {}
                });
        }
    });

}
const getCart = (req, res, next) => {
    const {uuid} = req.userInfo
    const {cuid} = req.params
    cartModel.findOne({cuid, uuid}, function (err, cart) {
        if (err) {
            return res.status(400).json({error: true, message: err});
        } else {
            if (cart)
                return res.status(201).json({
                    error: false,
                    message: textTranslate.find("cartFound"),
                    data: {cart: cart['_doc']}
                });
            else
                return res.status(404).json({
                    error: true,
                    message: textTranslate.find("cartWasNotFound"),
                    data: {}
                });
        }
    });
}
const getCarts = async (req, res, next) => {
    const {uuid, isAdmin} = req.userInfo
    const {status, sort} = req.query
    const search = {}
    if (!isAdmin)
        search.uuid = uuid
    if (status && Object.keys(configs.cartStatus).find(key => configs.cartStatus[key] === status))
        search.status = status
    try {
        const product = await cartModel.find({...search}).exec()
        if (product)
            return res.status(201).json({
                error: false,
                message: textTranslate.find("cartFound"),
                data: {listOfCarts: product.map(i => i['_doc'])}
            });
        else
            return res.status(404).json({
                error: true,
                message: textTranslate.find("cartWasNotFound"),
                data: {}
            });
    } catch (err) {
        return res.status(400).json({error: true, message: err});
    }
}
const checkout = async (req, res, next) => {
    const {uuid} = req.userInfo
    const {cuid} = req.body
    try {
        const cart = await cartModel.findOne({cuid, uuid}).exec()
        if (cart) {
            const items = cart['_doc'].items.map(i => i['_doc'])
            if (Object.keys(cart['_doc'].shippingAddress).length === 0)
                return res.status(400).json({
                    error: true,
                    message: textTranslate.find("addressMissing"),
                    data: {}
                });
            await cartModel.update({cuid}, {status: configs.cartStatus.submitted})
            let errorMsg = ''
            await Promise.all(_.map(items, async (
                {
                    puid, skuid, quantity

                }, index
            ) => {
                const product = await productModel.findOne({puid}).exec()
                if (product) {
                    if (product['_doc'].quantity === 0) {
                        errorMsg += product['_doc'].name + " with id " + product['_doc'].puid + " is out of stock"
                        return true
                    }
                    product['_doc'].skus.map(k => k['_doc']).map(k => {
                        return {
                            ...k,
                            skuid: JSON.stringify(k.skuid).replaceAll('"', ""),
                            _id: JSON.stringify(k._id).replaceAll('"', ""),
                        }
                    }).forEach(item => {
                        if (item.quantity < quantity) {
                            errorMsg += product['_doc'].name + " with id " + product['_doc'].puid + " and SKU " + item.skuid + " only (" + product['_doc'].quantity + ") items in stock"
                            return true
                        }
                    })
                    return true
                } else {
                    errorMsg += textTranslate.find("productWasNotFound")
                    return true

                }
            }))
            if (errorMsg.length > 0) {
                return res.status(404).json({
                    error: true,
                    message: errorMsg,
                    data: {}
                });
            }
            await Promise.all(_.map(items, async (
                {
                    puid, quantity

                }, index
            ) => {
                const product = await productModel.findOne({puid}).exec()
                if (product['_doc'].quantity > 0) {
                    const newQuantity = product['_doc'].quantity - 1
                    await productModel.update({puid}, {quantity: newQuantity}).exec()
                    return true
                }
                return true

            }))
            await cartModel.update({cuid}, {status: configs.cartStatus.submitted}).exec()
            const updatedCart = await cartModel.findOne({cuid, uuid}).exec()
            //TODO:send email
            return res.status(201).json({
                error: false,
                message: textTranslate.find("cartUpdatesSuccessfully"),
                data: {cart: updatedCart['_doc']}
            });
        } else {
            return res.status(404).json({
                error: true,
                message: textTranslate.find("cartWasNotFound"),
                data: {}
            });
        }
    } catch (err) {
        return res.status(400).json({error: true, message: err});
    }

}

module.exports = {
    creteCart,
    addItemToCart,
    removeItemFromCart,
    deleteCart,
    getCart,
    getCarts,
    checkout,
    updateCartStatus,
    setAddress
}