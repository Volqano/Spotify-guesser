require('dotenv').config();
const express = require('express');
const querystring = require('querystring');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { get_spotify_auth, get_user_data, get_spotify_tokens } = require('./spotify_auth');


app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', './src/views');

// function generating token required for authentication
function generateJWT(user) {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '24h' });
}

app.get('/login', (req, res) => {
  res.render('login');
});

// main menu route // if user is not loged in it will redirect him to /login
app.get('/', authenticateJWT, (req, res) => {
  // if auth is correct we will show main menu
  res.json({ user: req.user });
});

app.get('/spotify/login', function(req, res) {
  const auth_url = get_spotify_auth();
  res.redirect(auth_url);
});

// route for clearing token
app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

app.get('/callback', async function(req, res) {
  const code = req.query.code || null;
  const state = req.query.state || null;

  if (state === null) {
    res.redirect('/#' +
      querystring.stringify({ error: 'state_mismatch' }));
  } else {
    try {
      const tokens = await get_spotify_tokens(code);
      const access_token = tokens.access_token;
      const refresh_token = tokens.refresh_token;

      const user_data = await get_user_data(access_token);
      console.log('User data:', user_data);

      const jwtToken = generateJWT({
        id: user_data.id,
        name: user_data.display_name
      });

      res.cookie('token', jwtToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

      res.redirect('/');
    } catch (error) {
      res.status(500).send('Error while exchanging tokens or fetching user data');
    }
  }
});

// function we will use in endpoints that require user authentication
function authenticateJWT(req, res, next) {
  const token = req.cookies.token;

  // if there is no token or token is wrong we will redirect to /login route
  if (!token) {
    return res.redirect('/login');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.redirect('/login');
    }

    req.user = user; // storing user data in req
    
    console.log(`User authenticated: ${user.username || user.email || user.id}`);

    next();
  });
}

module.exports = app;