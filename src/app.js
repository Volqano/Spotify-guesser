require('dotenv').config();
const express = require('express');
const querystring = require('querystring');
const app = express();
const { get_spotify_auth, get_user_data, get_spotify_tokens } = require('./spotify_auth');

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/', (req, res) => {
  res.send('TEST');
});

app.get('/spotify/login', function(req, res) {
  const auth_url = get_spotify_auth();
  res.redirect(auth_url);
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

      // We need to store user data somewhere #6
      // req.session.access_token = access_token;
      // req.session.refresh_token = refresh_token;

      const user_data = await get_user_data(access_token);
      console.log('User data:', user_data);

      res.redirect('/');
    } catch (error) {
      res.status(500).send('Error while exchanging tokens or fetching user data');
    }
  }
});

module.exports = app;