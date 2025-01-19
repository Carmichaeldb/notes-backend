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
                content: 'This is a test note'
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

    //Share notes tests
    describe('POST /api/notes/:id/share share note', () => {
        it('should successfully share a note with another user', async () => {
            const response = await request(app)
                .post(`/api/notes/${testNoteId}/share`)  // Using existing testNoteId
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    sharedWith: 1
                });
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Note shared successfully');
        });
    });

    describe('POST /api/notes/:id/share fails with non-existing user', () => {
        it('should return an error', async () => {
            const response = await request(app)
            .post(`/api/notes/${testNoteId}/share`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                sharedWith: 99999
            });
        
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'User not found');
        });
    });

    describe('POST /api/notes/:id/share fails with non-existing note', () => {
        it('should return an error', async () => {const response = await request(app)
            .post('/api/notes/99999/share')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                sharedWith: 1
            });
        
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Note not found');
        });
    });

    describe('POST /api/notes/:id/share fails without authorization', () => {
        it('should return an error', async () => {
            const response = await request(app)
            .post(`/api/notes/1/share`)
            .send({
                sharedWith: 3
            });
        
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Access denied');
        });
    });

    describe('POST /api/notes/:id/share fails with invalid token', () => {
        it('should return an error', async () => {
            const response = await request(app)
                .post(`/api/notes/${testNoteId}/share`)
                .set('Authorization', 'Bearer invalid_token')
                .send({
                    sharedWith: 1
                });
        
        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty('error', 'Invalid token');
        });
    });

    //Search Notes Tests
    describe('GET /api/search search notes', () => {
        let searchNoteId;
    
        beforeAll(async () => {
            //extra note to search for
            const response = await request(app)
                .post('/api/notes')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Special Search Note',
                    content: 'This is a unique searchable content'
                });
            
            searchNoteId = response.body.id;
        });
    
        it('should find notes matching title', async () => {
            const response = await request(app)
                .get('/api/search?query=Updated')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(1);
            expect(response.body[0]).toHaveProperty('title', 'Updated Test Note');
        });

        it('should find notes matching content', async () => {
            const response = await request(app)
                .get('/api/search?query=unique searchable')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(1);
            expect(response.body[0]).toHaveProperty('title', 'Special Search Note');
        });

        it('should find multiple notes with common term', async () => {
            const response = await request(app)
                .get('/api/search?query=content')  // Should find both notes
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(2);
        });
    
        it('should return empty array for no matches', async () => {
            const response = await request(app)
                .get('/api/search?query=nonexistentterm123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });
    });

    describe('GET /api/search fails with missing query', () => {
        it('should return an error', async () => {
            const response = await request(app)
            .get('/api/search')
            .set('Authorization', `Bearer ${authToken}`);
        
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Search query is required');
        });
    });

    describe('GET /api/search fails with invalid token', () => {
        it('should return an error', async () => {
            const response = await request(app)
            .get('/api/search?q=test')
            .set('Authorization', 'Bearer invalid_token')
        
        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty('error', 'Invalid token');
        });
    });

    describe('GET /api/search fails without authorization', () => {
        it('should return an error', async () => {
            const response = await request(app)
                .get('/api/search?q=test');
        
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Access denied');
        });
    });
    //Delete Note tests
    describe('Delete /api/notes/:id delete note', () => {
        it('should delete a note successfully', async () => {
            const response = await request(app)
                .delete(`/api/notes/${testNoteId}`)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Note deleted successfully');
            
            // Verify note is actually deleted
            const getResponse = await request(app)
                .get(`/api/notes/${testNoteId}`)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(getResponse.status).toBe(404);
        });
    });

    describe('Delete /api/notes/:id fails non-existent note', () => {
        it('should return an error', async () => {
            const response = await request(app)
                .delete('/api/notes/99999')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Note not found');
        });
    });

    describe('Delete /api/notes/:id fails with invalid token', () => {
        it('should return an error', async () => {
            const response = await request(app)
                .delete(`/api/notes/${testNoteId}`)
                .set('Authorization', 'Bearer invalid_token')

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('error', 'Invalid token');
        });
    }); 

    describe('Delete /api/notes/:id fails update another users note', () => {
        it('should return an error', async () => {
            const response = await request(app)
                .delete(`/api/notes/1`)
                .set('Authorization', `Bearer ${authToken}`);
        
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Note not found');
        });
    });
});