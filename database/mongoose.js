//Set up mongoose connection
const mongoose = require('mongoose');
const mongoDB = configs.mangoDB.url;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
module.exports = mongoose;

