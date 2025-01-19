process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../app.js');
const db = require('../db/db'); 
const jwt = require('jsonwebtoken');

describe('User Routes', () => {
    let testUserId;
    let server;

    beforeAll((done) => {
        server = app.listen(done);
    });

    afterAll(async () => {
        if (testUserId) {
            // Direct DB cleanup since we don't have a delete endpoint
            await db.query('DELETE FROM users WHERE id = $1', [testUserId]);
        }
        await db.end();
        await server.close();
    });

    describe('POST /api/auth/signup Signs up user successfully and returns a valid token', () => {
        it('should create a user and return a token', async () => {
            const response = await request(app).post('/api/auth/signup').send({
                username: 'testuser',
                email: 'test@test.com',
                password: 'testpassword'
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('user');
            expect(response.body).toHaveProperty('token');
            expect(response.body.user).toHaveProperty('id');
            expect(response.body.user).toHaveProperty('username');
            expect(response.body.user).toHaveProperty('email');
            expect(response.body.user).not.toHaveProperty('password');
            //verify token
            const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
            expect(decoded).toHaveProperty('id');
            expect(decoded).toHaveProperty('username', 'testuser');
            expect(decoded).toHaveProperty('exp');

            testUserId = response.body.user.id;
        });
    });

    describe('Fails to sign up user, user exists', () => {
        it('should return an error', async () => {
            const response = await request(app).post('/api/auth/signup').send({
                username: 'testuser',
                email: 'test@test.com',
                password: 'testpassword'
            });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe('User already exists');
        });
    });

    describe('Fails to sign up user, missing require fields', () => {
        it('should return an error', async () => {
            const response = await request(app).post('/api/auth/signup').send({
                username: 'testuser',
                password: 'testpassword'
            });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe('missing required fields');
        });
    });

    describe('Logins in user successfully', () => {
        it('should return a token', async () => {
            const response = await request(app).post('/api/auth/login').send({
                username: 'testuser',
                password: 'testpassword'
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('user');
            expect(response.body).toHaveProperty('token');
            expect(response.body.user).toHaveProperty('id');
            expect(response.body.user).toHaveProperty('username');
            expect(response.body.user).toHaveProperty('email');
            expect(response.body.user).not.toHaveProperty('password');
            //verify token
            const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
            expect(decoded).toHaveProperty('id');
            expect(decoded).toHaveProperty('username', 'testuser');
            expect(decoded).toHaveProperty('exp');
        });
    });

    describe('Fails to login in user', () => {
        it('should return an error, wrong email', async () => {
            const response = await request(app).post('/api/auth/login').send({
                username: 'wrongusername',
                password: 'testpassword'
            });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe('Invalid username or password');
        });

        it('should return an error, wrong password', async () => {
            const response = await request(app).post('/api/auth/login').send({
                username: 'testuser',
                password: 'wrongpassword'
            });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe('Invalid username or password');
        });
    });
});