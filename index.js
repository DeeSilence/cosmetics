const config = require('./configs');
const translations = require('./configs/translations');
const translate = require('./utils/translate')
global.configs = config
global.translations = translations
global.textTranslate = translate
const healthCheck = require('./routes/healthCheck');
const users = require('./routes/users');
const files = require('./routes/files');
const product = require('./routes/product');
const cart = require('./routes/cart');
const validateUser = require('./utils/validateUser')

// require('./database/postgress')
require('./database/mongoose')
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors')
const app = express();
app.use(logger('dev'));
app.use(cors())
app.use(bodyParser.json());
app.use('/healthCheck', healthCheck)
app.use('/:lang/users', users)
app.use('/:lang/files', validateUser, files)
app.use('/:lang/product', validateUser, product)
app.use('/:lang/cart', validateUser, cart)
app.listen(config.port, function () {
    console.log('app listening on port 3000!');
});