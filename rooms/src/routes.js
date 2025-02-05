const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('./middleware');
const jwt = require('jsonwebtoken');
const querystring = require('querystring');

function generateJWT(user) {
    return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '24h' });
}

router.get('/',authenticateJWT,async function(req,res)
{
    res.send(req.user);
});

module.exports = {
    generateJWT,
    router
};