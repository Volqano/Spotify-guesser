const request = require('supertest');
const app = require('../src/app');


describe('Routes', () => {
    it('should respond with TEST on /', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
    });

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