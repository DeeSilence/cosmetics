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
const updateItems = async (req, res, next) => {
    const {uuid} = req.userInfo
    const {
        cuid,
        items
    } = req.body
    let missingRequired = ''
    if (!cuid)
        missingRequired += 'cuid, '
    if (!items)
        missingRequired += 'items, '

    if (missingRequired.length > 0) {
        return res.status(400).json({
            error: true,
            message: missingRequired + textTranslate.find("wasNotPassed"),
        });
    }
    try {
        const cart = await cartModel.findOne({cuid, uuid, status: configs.cartStatus.inProgress}).exec()
        if (cart) {
            //first find the car
            //             //send search for if the puid
            //             //if exist extract price and add item to cart
            //             //update cart
            //
            if (Array.isArray(items)) {
                const currentCartItem = cart['_doc'].items.map(i => i["_doc"])
                let errorMsg = null
                await Promise.all(_.map(items, async ({puid, skuid, quantity}, index) => {
                        if (!puid)
                            missingRequired += 'item[' + index + '].puid, '
                        if (!skuid)
                            missingRequired += 'item[' + index + '].skuid, '
                        if (!quantity)
                            missingRequired += 'item[' + index + '].quantity, '
                        if (missingRequired.length > 0) {
                            errorMsg = missingRequired + textTranslate.find("wasNotPassed")
                            return true
                        }
                        const product = await productModel.findOne({puid}).exec()
                        if (product) {
                            const skus = product['_doc'].skus
                            if (skus) {
                                const selectedSku = skus.map(k => k['_doc']).map(k => {
                                    return {
                                        ...k,
                                        skuid: JSON.stringify(k.skuid).replaceAll('"', ""),
                                        _id: JSON.stringify(k._id).replaceAll('"', ""),
                                    }
                                }).find(k => k.skuid === skuid)
                                if (selectedSku) {
                                    if (selectedSku.quantity < Math.abs(Math.round(quantity))) {
                                        errorMsg = product['_doc'].name + " with id " + product['_doc'].puid + " and skuID " + selectedSku.skuid + " only (" + selectedSku.quantity + ") items in stock"
                                        return true
                                    }
                                    if (selectedSku.quantity === 0) {
                                        errorMsg = product['_doc'].name + " with id " + product['_doc'].puid + " and skuID " + selectedSku.skuid + " only (" + selectedSku.quantity + ") out of stock"
                                        return true
                                    }
                                    let i = null
                                    if (currentCartItem.find((k, ik) => {
                                        if (k.skuid === skuid && k.puid === puid) {
                                            i = ik
                                            return k
                                        }
                                    })) {
                                        currentCartItem[i].quantity = Math.abs(Math.round(quantity))
                                        currentCartItem[i].product = product['_doc']
                                    } else {
                                        const newItem = {}
                                        newItem.quantity = Math.abs(Math.round(quantity))
                                        newItem.puid = puid
                                        newItem.skuid = skuid
                                        newItem.product = product['_doc']
                                        currentCartItem.push(newItem)
                                    }
                                } else {
                                    errorMsg = `item[${index}].sku ` + textTranslate.find("notValid")
                                    return true
                                }
                            } else {
                                errorMsg = textTranslate.find("noSkuAddedFor") + ` item[${index}].sku`
                                return true
                            }
                        } else {
                            errorMsg = `item[${index}].puid ` + textTranslate.find("notValid")
                            return true
                        }

                    }
                    )
                )
                if (errorMsg) {
                    return res.status(400).json({
                        error: true,
                        message: errorMsg,
                    });
                }
                let total = 0
                currentCartItem.forEach((a) => {
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
                await cartModel.update({cuid}, {total, items: currentCartItem}).exec()
                await Promise.all(_.map(items, async ({puid, skuid, quantity}, index) => {
                    let skuIndex = null
                    const product = await productModel.findOne({puid}).exec()
                    product['_doc'].skus.map(k => k['_doc']).map(k => {
                        return {
                            ...k,
                            skuid: JSON.stringify(k.skuid).replaceAll('"', ""),
                            _id: JSON.stringify(k._id).replaceAll('"', ""),
                        }
                    }).forEach((k, ik) => {
                        if (k.skuid === skuid) {
                            skuIndex = ik
                            return k
                        }
                    })
                    const itemToUpdate = product['_doc'].skus.map(k => k['_doc']).map(k => {
                        return {
                            ...k,
                            skuid: JSON.stringify(k.skuid).replaceAll('"', ""),
                            _id: JSON.stringify(k._id).replaceAll('"', ""),
                        }
                    })[skuIndex]
                    itemToUpdate.quantity = itemToUpdate.quantity - quantity
                    product['_doc'].skus.pull(itemToUpdate._id)
                    product['_doc'].skus.push(itemToUpdate)
                    await product.save()
                    let totalQuantity = 0;
                    product['_doc'].skus.forEach(item => {
                        totalQuantity += item.quantity
                    })
                    await productModel.update({puid}, {quantity: totalQuantity}).exec()
                }))
                const updatedCart = await cartModel.findOne({cuid}).exec()
                return res.status(201).json({
                    error: false,
                    message: textTranslate.find("cartUpdatesSuccessfully"),
                    data: {
                        cart: updatedCart["_doc"]
                    }
                });
            } else {
                return res.status(404).json({
                    error: true,
                    message: "items is Array Type" + textTranslate.find("wasNotPassed"),
                });
            }
        } else {
            return res.status(404).json({
                error: true,
                message: textTranslate.find("cartWasNotFound"),
                data: {}
            });
        }
    } catch
        (err) {
        return res.status(400).json({error: false, message: err});
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
            return res.status(400).json({error: false, message: err});
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
            if(Object.keys(cart['_doc'].shippingAddress).length === 0)
                return res.status(400).json({
                    error: true,
                    message: textTranslate.find("addressMissing"),
                    data: {}
                });
            await cartModel.update({cuid}, {status: configs.cartStatus.submitted})
            // TODO:send email
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

module.exports = {creteCart, updateItems, deleteCart, getCart, getCarts, checkout, updateCartStatus}