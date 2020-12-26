const jwt = require('jsonwebtoken');
const userModel = require('../models/users');

async function validateUser(req, res, next) {
    configs.lang = req.params.lang.toLowerCase()
    await jwt.verify(req.headers['authorization'], configs.jwtSecretKey, async function (err, decoded) {
        if (err) {
           return res.status(401).json({error: true, message: err.message, data: null});

        } else {
            try {
                const userInfo = await userModel.findOne({uuid: decoded.id}).exec()
                req.userInfo = userInfo['_doc']

            } catch (err) {
                return res.status(500).json({error: true, message: err.message, data: null});
            } finally {
                next();
            }

        }
    });

}

module.exports = validateUser