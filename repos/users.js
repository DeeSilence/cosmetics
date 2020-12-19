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
            res.status(400).json({error: false, message: err});
        } else {
            if (userInfo) {
                const token = jwt.sign({id: userInfo._id}, configs.jwtSecretKey, {expiresIn: '24h'});
                res.status(400).json({
                    error: false,
                    message: textTranslate.find("userAlreadyExist"),

                });
            }
        }
    });
    userModel.create({
        name,
        email,
        password,
        phoneNumber,
        gender,
        dataOfBirth
    }, function (err, result) {
        if (err)
            res.status(400).json({error: false, message: err});
        else
            res.status(201).json({error: false, message: textTranslate.find("userAddedSuccessfully")});

    });
}
const authenticate = (req, res, next) => {
    userModel.findOne({email: req.body.email}, function (err, userInfo) {
        if (err) {
            res.status(400).json({error: false, message: err});
        } else {
            if (bcrypt.compareSync(req.body.password, userInfo.password)) {
                const token = jwt.sign({id: userInfo.uuid}, configs.jwtSecretKey, {expiresIn: '24h'});
                res.status(201).json({
                    error: false,
                    message: textTranslate.find("userFound"),
                    data: {user: userInfo, token: token}
                });
            } else {
                res.status(400).json({error: true, message: textTranslate.find("InvalidUser"), data: null});
            }
        }
    });
}
module.exports = {
    create,
    authenticate
}