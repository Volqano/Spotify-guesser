const request = require('supertest');
const app = require('../src/app');
const { get_spotify_auth, get_spotify_tokens, get_user_data } = require('../src/spotify_auth');

jest.mock('../src/spotify_auth', () => ({
    get_spotify_auth: jest.fn(() => 'https://accounts.spotify.com/authorize?mocked'),
    get_spotify_tokens: jest.fn(async () => ({ access_token: 'mock_access_token', refresh_token: 'mock_refresh_token' })),
    get_user_data: jest.fn(async () => ({ id: 'mock_id', display_name: 'mock_user' }))
}));

describe('Spotify Authentication', () => {
    it('should redirect to Spotify login URL on /spotify/login', async () => {
        const response = await request(app).get('/spotify/login');
        expect(response.status).toBe(302);
        expect(response.header.location).toContain('https://accounts.spotify.com/authorize');
    });

    it('should handle state mismatch on /callback', async () => {
        const response = await request(app).get('/callback');
        expect(response.status).toBe(302);
        expect(response.header.location).toContain('#error=state_mismatch');
    });
});
