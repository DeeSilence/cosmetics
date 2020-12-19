const jwt = require('jsonwebtoken');
const userModel = require('../models/users');

function validateUser(req, res, next) {
    configs.lang = req.params.lang.toLowerCase()
    jwt.verify(req.headers['authorization'], configs.jwtSecretKey, function (err, decoded) {
        if (err) {
            res.json({error: true, message: err.message, data: null});
            next();

        } else {
            userModel.findOne({uuid: decoded.id}, function (err, userInfo) {
                if (err) {
                    next(err);
                } else {
                    req.userInfo = userInfo['_doc']
                }
                next();

            });
        }
    });

}

module.exports = validateUser