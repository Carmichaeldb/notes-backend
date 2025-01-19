const request = require('supertest');
const app = require('../app');
const db = require('../db/db');

describe('Rate Limiting', () => {
    describe('Auth Rate Limiting', () => {
        it('should limit repeated login attempts', async () => {
            // Make 11 rapid login attempts
            const attempts = [];
            for (let i = 0; i < 11; i++) {
                const response = await request(app)
                    .post('/api/auth/login')
                    .send({
                        username: 'nonexistent',
                        password: 'wrong'
                    });
                attempts.push(response.status);
            }

            // First 10 should be 401
            expect(attempts.slice(0, 10)).toEqual(Array(10).fill(401));
            // 11th should be 429
            expect(attempts[10]).toBe(429);
        });
    });

    describe('API Rate Limiting', () => {
        let testUserId;
        beforeAll(async () => { 
            //Clear auth rate limiter
            await new Promise(resolve => setTimeout(resolve, 1000));
        });

        afterAll(async () => {
            if (testUserId) {
                // Direct DB cleanup since we don't have a delete endpoint
                await db.query('DELETE FROM users WHERE id = $1', [testUserId]);
            }
            await db.end();
        });
        it('should limit repeated API calls', async () => {
            // Create a test user and get token
            const authResponse = await request(app)
                .post('/api/auth/signup')
                .send({
                    username: 'ratelimituser',
                    email: 'ratelimit@test.com',
                    password: 'password123'
                });
            console.log('Auth Response:', authResponse.body);
            const token = authResponse.body.token;
            testUserId = authResponse.body.user.id;
            console.log('Token created:', token);

            // Make 5 rapid requests
            const attempts = [];
            for (let i = 0; i < 50; i++) {
                const response = await request(app)
                    .get('/api/notes')
                    .set('Authorization', `Bearer ${token}`);
                    console.log(`Request ${i + 1} status:`, response.status);
                    if (response.status !== 200) {
                        console.log(`Request ${i + 1} body:`, response.body);
                    }
                attempts.push(response.status);
            }

            // First 49 should be 200
            expect(attempts.slice(0, 49)).toEqual(Array(49).fill(200));
            // 50th should be 429
            expect(attempts[49]).toBe(429);
        });
    });
});
