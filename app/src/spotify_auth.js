const axios = require('axios');
const crypto = require('crypto');
const querystring = require('querystring');
const path = require('path');
const dotenv = require('dotenv');
const parentDir = path.resolve(__dirname, '..');
const envPath = path.join(parentDir, '.env');
dotenv.config({ path: envPath });
const ip_address = process.env.SERVER_IP || 'localhost';
const client_id = process.env.SPOTIFY_CLIENT_ID;
const redirect_uri = `http://${ip_address}:81/callback`;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
//const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

function generateRandomString(length) {
    return crypto.randomBytes(length).toString('base64url');
}

function get_spotify_auth() {
    const state = generateRandomString(16);
    const scope = 'user-read-private user-read-email user-read-currently-playing user-modify-playback-state user-read-playback-state';

    const authUrl = 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
        });

    return authUrl;
}

async function get_spotify_tokens(code) {
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        data: querystring.stringify({
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        }),
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64')
        },
    };

    try {
        const response = await axios.post(authOptions.url, authOptions.data, { headers: authOptions.headers });
        return response.data;
    } catch (error) {
        console.error('Error while exchanging tokens', error);
        throw error;
    }
}

async function get_user_data(access_token) {
    try {
        const response = await axios.get('https://api.spotify.com/v1/me', {
            headers: { 'Authorization': `Bearer ${access_token}` }
        });
        return response.data;
    } catch (error) {
      console.error('Error fetching user data', error);
      throw error;
    }
}
  

module.exports = { 
    get_spotify_auth,
    get_spotify_tokens,
    get_user_data
};