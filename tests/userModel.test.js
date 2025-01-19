require('dotenv').config();
const userModel = require('../models/users');
const db = require('../db/db');
describe('User Model', () => {
    let testUserId;
    
    afterAll(async () => {
        // delete test user after tests
        if (testUserId) {
            await db.query('DELETE FROM users WHERE id = $1', [testUserId]);
        }
        await db.end();
    });

    // get user information
    describe('Checks User Exists successfully', () => {
        it('should return the correct user', async () => {
            const result = await userModel.getUser(1);
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('username');
            expect(result).toHaveProperty('password');
        });
    });

    describe('Checks User Does Not Exist', () => {
        it('should return an error', async () => {
            try {
            await userModel.getUser(999);
            fail('Expected an error to be thrown');
            } catch(error) {
            expect(error.message).toBe('User does not exist');
            }
        });
    });

    // Create User
    describe('Create User', () => {
        it('should create a user and issue token', async () => {
            const result = await userModel.createUser('testuser', 'test@test.com', 'testpassword');
            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('token');
            expect(result.user).toHaveProperty('id');
            expect(result.user).toHaveProperty('username');
            expect(result.user).not.toHaveProperty('password');
            testUserId = result.user.id;
        });
    });
    
    describe('Fails to create user missing email', () => {
        it('should return an error', async () => {
            try {
                await userModel.createUser('testuser', 'testpassword');
                fail('Expected an error to be thrown');
            } catch(error) {
                expect(error.message).toBe('missing required fields');
            }
        });
    });

    describe('Fails to create user missing password', () => {
        it('should return an error', async () => {
            try {
                await userModel.createUser('testuser', 'test@test.com');
                fail('Expected an error to be thrown');
            } catch(error) {
                expect(error.message).toBe('missing required fields');
            }
        });
    });

    describe('Fails to create user missing username', () => {
        it('should return an error', async () => {
            try {
                await userModel.createUser('test@test.com', 'testpassword');
                fail('Expected an error to be thrown');
            } catch(error) {
                expect(error.message).toBe('missing required fields');
            }
        });
    });

    describe('Fails to create user, user exists', () => {
        it('should return an error', async () => {
            try {
                await userModel.createUser('testuser', 'test@test.com', 'testpassword');
                fail('Expected an error to be thrown');
            } catch(error) {
                expect(error.message).toBe('User already exists');
            }
        });
    });

    // login user
    describe('Login User', () => {
        it('should return the correct user', async () => {
            const result = await userModel.loginUser('testuser', 'testpassword');
            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('token');
            expect(result.user).toHaveProperty('id');
            expect(result.user).toHaveProperty('username');
            expect(result.user).toHaveProperty('email');
        });
    });

    describe('Fails to login user, invalid username', () => {
        it('should return an error', async () => {
            try {
                await userModel.loginUser('invaliduser', 'testpassword');
                fail('Expected an error to be thrown');
            } catch(error) {
                expect(error.message).toBe('Invalid username or password');
            }
        });
    });
});