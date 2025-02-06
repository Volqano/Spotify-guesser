const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('./middleware');
const { get_spotify_auth, get_user_data, get_spotify_tokens } = require('./spotify_auth');
const jwt = require('jsonwebtoken');
const querystring = require('querystring');

// generate JWT token for user authentication
function generateJWT(user) {
    return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '24h' });
}

router.get('/login', (req, res) => {
    res.render('login');
});

// main menu route // if user is not loged in it will redirect him to /login
router.get('/', authenticateJWT, (req, res) => {
    res.render('main', { user: req.user });
});

router.get('/spotify/login', function(req, res) {
    const auth_url = get_spotify_auth();
    res.redirect(auth_url);
});

// route for clearing token
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

router.get('/callback', async function(req, res) {
    const code = req.query.code || null;
    const state = req.query.state || null;

    if (state === null) {
        return res.redirect('/#' + querystring.stringify({ error: 'state_mismatch' }));
    } 
    try {
        const tokens = await get_spotify_tokens(code);
        const access_token = tokens.access_token;
        console.log('Code received:', code);
        console.log('Access token received:', access_token);
        const refresh_token = tokens.refresh_token;

        const user_data = await get_user_data(access_token);
        console.log('User data:', user_data);

        const jwtToken = generateJWT({
            id: user_data.id,
            name: user_data.display_name,
            email: user_data.email,
            image: user_data.images,
            refresh_token: refresh_token,
            access_token: access_token,
        });

        res.cookie('token', jwtToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        return res.redirect('/');
    } catch (error) {
        console.error('Error while exchanging tokens or fetching user data', error);
        return res.redirect('/login?error=auth_failed');
    }
});

router.get('/stats',authenticateJWT, async function (req,res) {
    res.render('score_board', {user: req.user, myWins: 5, gamesPlayed: 1, top10Wins: ['miau', 1,2,3,4,5,6,7,8,9],
        top10GamesPlayed: ['miau', 1,2,3,4,5,6,7,8,9], lastPlayedWithWins: ['miau', 1,2,3,4,5,6,7,8,9]} )
});

module.exports = {
    generateJWT,
    router
};
