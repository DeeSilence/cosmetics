const cartModel = require("../models/cart")
const {productModel} = require("../models/product")
const moment = require('moment')
const _ = require('lodash')
const creteCart = (req, res, next) => {
    const {uuid} = req.userInfo
    cartModel.findOne({uuid, status: configs.cartStatus.inProgress}, async function (err, cart) {
        if (err) {
            res.status(400).json({error: true, message: err});
        } else {
            if (cart) {
                res.status(201).json({
                    error: false,
                    message: textTranslate.find("userAlreadyHaveCart"),
                    data: cart["_doc"]
                });
            } else {
                const total = '0'
                const createDate = moment(new Date()).format("DD/MM/YYYY")
                const currency = configs.currency

                cartModel.create({
                    uuid, total, createDate, currency,
                }, function (err, result) {
                    if (err)
                        res.status(400).json({error: true, message: err});
                    else {
                        cartModel.findOne({uuid}, async function (newErr, newCart) {
                            res.status(201).json({
                                error: false,
                                message: textTranslate.find("cartCreatedSuccessfully"),
                                data: newCart["_doc"]
                            });

                        })
                    }

                });
            }
        }
    })

}
const updateItems = (req, res, next) => {
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
    cartModel.findOne({cuid, uuid, status: configs.cartStatus.inProgress}, async function (err, cart) {
        if (err) {
            res.status(400).json({error: false, message: err});
        } else {
            if (cart) {
                //first find the car
                //send search for if the puid
                //if exist extract price and add item to cart
                //update cart

                if (Array.isArray(items)) {
                    const currentCartItem = cart['_doc'].items.map(i => i["_doc"])
                    let errorMsg = null
                    await Promise.all(_.map(items, async (
                        {
                            puid, quantity

                        }, index
                    ) => {
                        if (!puid)
                            missingRequired += 'item[' + index + '].puid, '
                        if (!quantity)
                            missingRequired += 'item[' + index + '].quantity, '
                        if (missingRequired.length > 0) {
                            errorMsg = missingRequired + textTranslate.find("wasNotPassed")
                            return true
                        }
                        await productModel.findOne({puid}, async function (err, product) {
                            if (product) {
                                if (product['_doc'].quantity < Math.abs(Math.round(quantity))) {
                                    errorMsg = product['_doc'].name + " with id " + product['_doc'].puid + " only (" + product['_doc'].quantity + ") items in stock"
                                    return true
                                }
                                if (product['_doc'].quantity === 0) {
                                    errorMsg = product['_doc'].name + " with id " + product['_doc'].puid + " out of stock"
                                    return true
                                }
                                let i = null
                                if (currentCartItem.find((k, ik) => {
                                    if (k.puid === puid) {
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
                                    newItem.product = product['_doc']
                                    currentCartItem.push(newItem)
                                }
                            } else {
                                errorMsg = `item[${index}].puid ` + textTranslate.find("notValid")
                                return true
                            }
                        })
                        return true
                    }))
                    if (errorMsg) {
                        return res.status(400).json({
                            error: true,
                            message: errorMsg,
                        });
                    }
                    let total = 0
                    currentCartItem.forEach((a) => total += (parseFloat(a.product.salePrice || a.product.originalPrice) * a.quantity))
                    await cartModel.update({cuid}, {total, items: currentCartItem}, function (err, updatedProduct) {
                        if (err) {
                            res.status(400).json({error: true, message: err});
                        } else {
                            cartModel.findOne({cuid}, async function (updatedErr, updatedCart) {
                                    if (updatedErr) {
                                        res.status(400).json({error: false, message: err});
                                    } else {
                                        res.status(201).json({
                                            error: false,
                                            message: textTranslate.find("cartUpdatesSuccessfully"),
                                            data: {
                                                cart: updatedCart["_doc"]
                                            }
                                        });
                                    }
                                }
                            )
                        }
                    });
                } else {
                    return res.status(400).json({
                        error: true,
                        message: "items is Array Type" + textTranslate.find("wasNotPassed"),
                    });
                }
            } else
                res.status(404).json({
                    error: true,
                    message: textTranslate.find("cartWasNotFound"),
                    data: {}
                });
        }
    });
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
            res.status(400).json({error: false, message: err});
        } else {
            if (cart) {
                cartModel.deleteOne({_id: cart["_doc"]["_id"]}, function (err) {
                    if (err) {
                        res.status(400).json({error: true, message: err});
                    } else {
                        res.status(201).json({
                            error: false,
                            message: textTranslate.find("cartDeletedSuccessfully"),
                            data: {}
                        });
                    }
                });
            } else
                res.status(400).json({
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
            res.status(400).json({error: true, message: err});
        } else {
            if (cart)
                res.status(201).json({
                    error: false,
                    message: textTranslate.find("cartFound"),
                    data: {cart: cart['_doc']}
                });
            else
                res.status(404).json({
                    error: true,
                    message: textTranslate.find("cartWasNotFound"),
                    data: {}
                });
        }
    });
}
const getCarts = (req, res, next) => {
    const {uuid, isAdmin} = req.userInfo
    const {status, sort} = req.query
    const search = {}
    if (!isAdmin)
        search.uuid = uuid
    if (status && Object.keys(configs.cartStatus).find(key => configs.cartStatus[key] === status))
        search.status = status
    cartModel.find({...search}, function (err, product) {
        if (err) {
            res.status(400).json({error: true, message: err});
        } else {
            if (product)
                res.status(201).json({
                    error: false,
                    message: textTranslate.find("cartFound"),
                    data: {product: product['_doc']}
                });
            else
                res.status(404).json({
                    error: true,
                    message: textTranslate.find("cartWasNotFound"),
                    data: {}
                });
        }
    });
}
const checkout = async (req, res, next) => {
    const {uuid} = req.userInfo
    const {cuid} = req.body
    try {
        const cart = await cartModel.findOne({cuid, uuid}).exec()
        if (cart) {
            const items = cart['_doc'].items.map(i => i['_doc'])
            await cartModel.update({cuid}, {status: configs.cartStatus.submitted})
            // TODO:send email
            let errorMsg = ''
            await Promise.all(_.map(items, async (
                {
                    puid, quantity

                }, index
            ) => {
                const product = await productModel.findOne({puid}).exec()
                if (product) {
                    if (product['_doc'].quantity === 0) {
                        errorMsg += product['_doc'].name + " with id " + product['_doc'].puid + " is out of stock"
                        return true
                    }
                    if (product['_doc'].quantity < quantity) {
                        errorMsg += product['_doc'].name + " with id " + product['_doc'].puid + " only (" + product['_doc'].quantity + ") items in stock"
                        return true
                    }
                    return true
                } else {
                    errorMsg += textTranslate.find("productWasNotFound")
                    return true

                }
            }))
            if (errorMsg.length > 0) {
                res.status(404).json({
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
            res.status(201).json({
                error: false,
                message: textTranslate.find("cartUpdatesSuccessfully"),
                data: {cart: updatedCart['_doc']}
            });
        } else {
            res.status(404).json({
                error: true,
                message: textTranslate.find("cartWasNotFound"),
                data: {}
            });
        }
    } catch (err) {
        res.status(400).json({error: true, message: err});
    }
    // cartModel.findOne({cuid, uuid}, function (err, cart) {
    //     if (err) {
    //         res.status(400).json({error: true, message: err});
    //     } else {
    //         if (cart) {
    //
    //             cartModel.update({cuid}, {status: configs.cartStatus.submitted}, function (err, updatedProduct) {
    //                 if (err) {
    //                     res.status(400).json({error: true, message: err});
    //                 } else {
    //
    //                     cartModel.findOne({cuid, uuid}, function (updatedErr, updatedCart) {
    //                         res.status(201).json({
    //                             error: false,
    //                             message: textTranslate.find("cartUpdatesSuccessfully"),
    //                             data: {cart: updatedCart['_doc']}
    //                         });
    //                     })
    //
    //                 }
    //             });
    //
    //         } else
    //             res.status(404).json({
    //                 error: true,
    //                 message: textTranslate.find("cartWasNotFound"),
    //                 data: {}
    //             });
    //     }
    // });
}
module.exports = {creteCart, updateItems, deleteCart, getCart, getCarts, checkout}