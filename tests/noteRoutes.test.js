process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../app.js');
const db = require('../db/db'); 
const jwt = require('jsonwebtoken');

describe('Note Routes', () => {
    let authToken;
    let testUserId;
    let testNoteId;

    beforeAll(async () => {
        // sign up user
        const response = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'testuser',
                email: 'testnotes@test.com',
                password: 'password123'
            });
        
        authToken = response.body.token;
        testUserId = response.body.user.id;
    });

    // delete user after tests
    afterAll(async () => {
        if (testUserId) {
            await db.query('DELETE FROM users WHERE id = $1', [testUserId]);
        }
        await db.end();
    });

    // POST /api/notes Create a note Tests
    describe('POST /api/notes successfully creates a note', () => {
        it('should create a note', async () => {
            const response = await request(app)
                .post('/api/notes')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Test Note',
                    content: 'This is a test note'
                });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('title', 'Test Note');
            expect(response.body).toHaveProperty('content', 'This is a test note');
            testNoteId = response.body.id;
        });
    });

    describe('POST /api/notes fails to create a note missing fields', () => {
        it('should return an error', async () => {
            const response = await request(app)
                .post('/api/notes')
                .set('Authorization', `Bearer ${authToken}`)
                .send({});
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Missing required fields');
        });
    });

    describe('POST /api/notes fails with invalid token', () => {
        it('should return an error', async () => {
            const response = await request(app)
                .post('/api/notes')
                .set('Authorization', 'Bearer invalid_token')
                .send({
                title: 'Test Note',
                content: 'This is a test note',
                user_id: 999
            });
        
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('error', 'Invalid token');
        });
    });

    //GET /api/notes/ get all notes for user
    describe('GET /api/notes/ get all notes for user', () => {
        it('should return all notes for user', async () => {
            const response = await request(app)
            .get('/api/notes')
            .set('Authorization', `Bearer ${authToken}`);
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThanOrEqual(1); // We know we have at least one note
        
        // Verify note structure
        const note = response.body[0];
        expect(note).toHaveProperty('id');
            expect(note).toHaveProperty('title');
            expect(note).toHaveProperty('content');
            expect(note.user_id).toBe(testUserId);
        });
    });

    describe('GET /api/notes/ fails with invalid token', () => {
        it('should return an error', async () => {
            const response = await request(app)
                .get('/api/notes')
                .set('Authorization', 'Bearer invalid_token')              
                .send({
                    user_id: 999
                });
            
                expect(response.status).toBe(403);
                expect(response.body).toHaveProperty('error', 'Invalid token');
        });
    });

    //GET /api/notes/:id get a specific note
    describe('GET /api/notes/:id get a specific note', () => {
        it('should return a specific note', async () => {
            const response = await request(app)
                .get(`/api/notes/${testNoteId}`)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', testNoteId);
            expect(response.body).toHaveProperty('title', 'Test Note');
            expect(response.body).toHaveProperty('content', 'This is a test note');
        });
    });

    describe('GET /api/notes/:id fails valid note invalid user', () => {
        it('should return an error', async () => {
            const response = await request(app)
                .get(`/api/notes/1`)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Note not found');
        });
    });

    describe('GET /api/notes/:id fails with invalid token', () => {
        it('should return an error', async () => {
            const response = await request(app)
                .get(`/api/notes/${testNoteId}`)
                .set('Authorization', 'Bearer invalid_token')                
                .send({
                    user_id: 999
                });
            
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('error', 'Invalid token');
        });
    });

    //PUT /api/notes/:id update a note
    describe('PUT /api/notes/:id update note', () => {
        it('should update a note successfully', async () => {
            const response = await request(app)
                .put(`/api/notes/${testNoteId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Updated Test Note',
                    content: 'This is the updated content'
                });
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', testNoteId);
            expect(response.body).toHaveProperty('title', 'Updated Test Note');
            expect(response.body).toHaveProperty('content', 'This is the updated content');
        });
    });
    
    describe('PUT /api/notes/:id fails with missing fields', () => {
        it('should return an error', async () => {
            const response = await request(app)
                .put(`/api/notes/${testNoteId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({});
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Missing required fields');
        });
    });

    describe('PUT /api/notes/:id fails with non-existent note', () => {
        it('should fail to update non-existent note', async () => {
            const response = await request(app)
                .put('/api/notes/99999')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Updated Test Note',
                    content: 'This is the updated content'
                });
        
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Note not found');
        });
    });

    describe('PUT /api/notes/:id fails with invalid token', () => {
        it('should return an error', async () => {
            const response = await request(app)
                .get(`/api/notes/${testNoteId}`)
                .set('Authorization', 'Bearer invalid_token')                
                .send({
                    user_id: 999,
                    title: 'Updated Test Note',
                    content: 'This is the updated content'
                });
            
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('error', 'Invalid token');
        });
    });

    describe('Put /api/notes/:id fails update another users note', () => {
        it('should return an error', async () => {
            const response = await request(app)
                .put(`/api/notes/1`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                title: 'Trying to Update',
                content: 'Trying to update other user note'
            });
        
        expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Note not found');
        });
    });
});