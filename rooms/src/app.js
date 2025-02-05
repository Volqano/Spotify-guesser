require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const { authenticateJWT } = require('./middleware');
const app = express();

app.use(cookieParser());
app.use(express.static(__dirname+"/public"));
app.set('view engine', 'ejs');
app.set('views', './src/views');

// import routes
const { router } = require('./routes');
app.use(router);

module.exports = app;