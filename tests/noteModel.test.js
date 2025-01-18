require('dotenv').config();
const noteModel = require('../models/notes');
const db = require('../db/db');

describe('Note Model query tests', () => {

    afterAll(async () => {
        await db.end();
    });

    // Testing for getUsersNotes
    describe('Get users notes successfully', () => {
        it('should return users notes', async () => {
            const result = await noteModel.getUsersNotes(1);
            expect(result).toHaveLength(1);

            result.forEach(note => {
                expect(note).toHaveProperty('id');
                expect(note).toHaveProperty('title');
                expect(note).toHaveProperty('content');
                expect(note).toHaveProperty('created_at');
                expect(note).toHaveProperty('updated_at');
            });
        });
    });

    describe('Fail to get non-existent user notes', () => {
        it('should return an empty array', async () => {
            const result = await noteModel.getUsersNotes(999);
            expect(result).toHaveLength(0);
        });
    });

    // Tests to get shared notes
    describe('Get shared notes successfully', () => {
        it('should return shared notes', async () => {
            const result = await noteModel.getSharedNotes(1);
            expect(result).toHaveLength(1);

            result.forEach(note => {
                expect(note).toHaveProperty('id');
                expect(note).toHaveProperty('title');
                expect(note).toHaveProperty('content');
                expect(note).toHaveProperty('created_at');
                expect(note).toHaveProperty('updated_at');
                expect(note).toHaveProperty('shared_by');
                expect(note).toHaveProperty('shared_at');
                expect(note).toHaveProperty('shared_by_username');
            });
        });
    });

    describe('Fail to get non-existent shared notes', () => {
        it('should return an empty array', async () => {
            const result = await noteModel.getSharedNotes(999);
            expect(result).toHaveLength(0);
        });
    });
});