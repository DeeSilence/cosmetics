const userModel = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const create = (req, res, next) => {
    const {
        name,
        email,
        password,
        phoneNumber,
        gender,
        dataOfBirth
    } = req.body
    let missingRequired = ''
    if (!name)
        missingRequired += 'name, '
    if (!email)
        missingRequired += 'email, '

    if (!password)
        missingRequired += 'password, '
    if (!phoneNumber)
        missingRequired += 'phoneNumber, '
    if (!gender)
        missingRequired += 'name, '
    if (!dataOfBirth)
        missingRequired += 'dataOfBirth, '
    if (missingRequired.length > 0) {
        return res.status(400).json({
            error: true,
            message: missingRequired + textTranslate.find("wasNotPassed"),
        });
    }

    userModel.findOne({email, phoneNumber}, function (err, userInfo) {
        if (err) {
            return res.status(400).json({error: false, message: err});
        } else {
            if (userInfo) {
                const token = jwt.sign({id: userInfo._id}, configs.jwtSecretKey, {expiresIn: '24h'});
                return res.status(400).json({
                    error: false,
                    message: textTranslate.find("userAlreadyExist"),

                });
            }
        }
    });
    const hashedPassword  = bcrypt.hashSync(this.password, global.configs.saltRounds);
    userModel.create({
        name,
        email,
        password:hashedPassword,
        phoneNumber,
        gender,
        dataOfBirth
    }, function (err, result) {
        if (err)
            return res.status(400).json({error: false, message: err});
        else
            return res.status(201).json({error: false, message: textTranslate.find("userAddedSuccessfully")});

    });
}
const authenticate = async (req, res, next) => {
    const {email, password} = req.body
    let missingRequired = ''
    if (!email)
        missingRequired += 'email, '
    if (!password)
        missingRequired += 'password, '
    if (missingRequired.length > 0) {
        return res.status(400).json({
            error: true,
            message: missingRequired + textTranslate.find("wasNotPassed"),
        });
    }
    try {
        const userInfo = await userModel.findOne({email}).exec()
        if (userInfo) {
            if (bcrypt.compareSync(password, userInfo.password)) {
                const token = jwt.sign({id: userInfo.uuid}, configs.jwtSecretKey, {expiresIn: '24h'});
                return res.status(201).json({
                    error: false,
                    message: textTranslate.find("userFound"),
                    data: {user: userInfo, token: token}
                });
            } else {
                return res.status(400).json({error: true, message: textTranslate.find("InvalidUser"), data: null});
            }
        } else {
            return res.status(400).json({error: true, message: textTranslate.find("InvalidUser"), data: null});
        }
    } catch (err) {
        return res.status(400).json({error: false, message: err});
    }
}
const addAddress = async (req, res, next) => {
    const {uuid} = req.userInfo
    const {latitude, longitude, addressDescription} = req.body

    let missingRequired = ''
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
        const userInfo = await userModel.findOne({uuid}).exec()
        if (userInfo) {
            userInfo['_doc'].listOfAddress.push({latitude, longitude, addressDescription})
            await userInfo.save()
            const updatedUserInfo = await userModel.findOne({uuid}).exec()
            return res.status(201).json({
                error: false,
                message: textTranslate.find("addressAddedSuccessfully"),
                data: updatedUserInfo['_doc']
            });
        } else {
            return res.status(400).json({error: true, message: textTranslate.find("InvalidUser"), data: null});
        }
    } catch (err) {
        return res.status(400).json({error: true, message: err});
    }
}
const updateAddress = async (req, res, next) => {
    const {uuid} = req.userInfo
    const {latitude, longitude, addressDescription, auid} = req.body

    let missingRequired = ''
    if (!auid)
        missingRequired += 'auid, '
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
        const userInfo = await userModel.findOne({uuid}).exec()
        if (userInfo) {
            const address = userInfo['_doc'].listOfAddress.map(k => {
                return {
                    ...k,
                    auid: JSON.stringify(k.auid).replaceAll('"', "")
                }
            }).find(item => item.auid === auid)
            if (address) {
                userInfo['_doc'].listOfAddress.pull(address['_doc']._id)
                userInfo['_doc'].listOfAddress.push({longitude, latitude, addressDescription})
                await userInfo.save()
                const updatedUserInfo = await userModel.findOne({uuid}).exec()
                return res.status(201).json({
                    error: false,
                    message: textTranslate.find("addressUpdatesSuccessfully"),
                    data: updatedUserInfo['_doc']
                });
            } else {
                return res.status(404).json({
                    error: true,
                    message: textTranslate.find("addressWasNotFound"),
                    data: {}
                });
            }
        } else {
            return res.status(400).json({error: true, message: textTranslate.find("InvalidUser"), data: null});
        }
    } catch (err) {
        return res.status(400).json({error: true, message: err});
    }
}
const deleteAddress = async (req, res, next) => {
    const {uuid} = req.userInfo
    const {auid} = req.body

    let missingRequired = ''
    if (!auid)
        missingRequired += 'auid, '

    if (missingRequired.length > 0) {
        return res.status(400).json({
            error: true,
            message: missingRequired + textTranslate.find("wasNotPassed"),
        });
    }
    try {
        const userInfo = await userModel.findOne({uuid}).exec()
        if (userInfo) {
            const address = userInfo['_doc'].listOfAddress.map(k => {
                return {
                    ...k,
                    auid: JSON.stringify(k.auid).replaceAll('"', "")
                }
            }).find(item => item.auid === auid)
            if (address) {
                userInfo['_doc'].listOfAddress.pull(address['_doc']._id)
                await userInfo.save()
                const updatedUserInfo = await userModel.findOne({uuid}).exec()
                return res.status(201).json({
                    error: false,
                    message: textTranslate.find("addressUpdatesSuccessfully"),
                    data: updatedUserInfo['_doc']
                });
            } else {
                return res.status(404).json({
                    error: true,
                    message: textTranslate.find("addressWasNotFound"),
                    data: {}
                });
            }

        } else {
            return res.status(400).json({error: true, message: textTranslate.find("InvalidUser"), data: null});
        }
    } catch (err) {
        return res.status(400).json({error: true, message: err});
    }
}
const getUser = async (req, res, next) => {
    const {isAdmin} = req.userInfo
    const {uuid} = req.params
    if (!isAdmin)
        return res.status(400).json({
            error: true,
            message: textTranslate.find('notAuthorized'),

        })
    let missingRequired = ''
    if (!uuid)
        missingRequired += 'uuid, '
    if (missingRequired.length > 0) {
        return res.status(400).json({
            error: true,
            message: missingRequired + textTranslate.find("wasNotPassed"),
        });
    }
    try {
        const user = await userModel.findOne({uuid}).exec()
        if (!user)
            return res.status(404).json({
                error: true,
                message: textTranslate.find("userWasNotFound"),
                data: {}
            });
        return res.status(201).json({
            error: false,
            message: textTranslate.find("userFound"),
            data: { user:user['_doc']}
        });
    } catch (err) {
        return res.status(400).json({error: true, message: err});
    }
}
const getUsers = async (req, res, next) => {
    const {isAdmin} = req.userInfo
    if (!isAdmin)
        return res.status(400).json({
            error: true,
            message: textTranslate.find('notAuthorized'),

        })

    try {
        const users = await userModel.find({}).exec()
        if (users)
            return res.status(201).json({
                error: false,
                message: textTranslate.find("userFound"),
                data: {users: users.map(i => i['_doc'])}
            });
        else
            return res.status(404).json({
                error: true,
                message: textTranslate.find("userWasNotFound"),
                data: {}
            });
    } catch (err) {
        return res.status(400).json({error: true, message: err});
    }
}
module.exports = {
    create,
    authenticate,
    getUser,
    getUsers,
    addAddress,
    updateAddress,
    deleteAddress
}