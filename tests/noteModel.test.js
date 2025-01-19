require('dotenv').config();
const noteModel = require('../models/notes');
const db = require('../db/db');


describe('Note Model query tests', () => {
    let testNoteId;

    afterAll(async () => {
        // Delete test note if still exists (due to failed test)
        if (testNoteId) {
            await db.query('DELETE FROM notes WHERE id = $1', [testNoteId]);
        }
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

    // Tests to get a note by id
    describe('Get note by id successfully', () => {
        it('should return the note', async () => {
            const result = await noteModel.getNoteById(1, 1);
            expect(result).toHaveProperty('id', 1);
            expect(result).toHaveProperty('title');
            expect(result).toHaveProperty('content');
            expect(result).toHaveProperty('created_at');
            expect(result).toHaveProperty('updated_at');
        });
    });

    describe('Fail to get non-existent note', () => {
        it('should return an error', async () => {
            try { await noteModel.getNoteById(1, 999);
                fail('Expected an error to be thrown');
            } catch (error) {
                expect(error.message).toBe('Note not found');
            }
        });
    });

    describe('fail to get note by id for other users', () => {
        it('should return an error', async () => {
            try { await noteModel.getNoteById(3, 1);
                fail('Expected an error to be thrown');
            } catch (error) {
                expect(error.message).toBe('Note not found');
            }
        });
    });

    // Tests to create a note
    describe('Create a note successfully', () => {
        it('should return the created note', async () => {
            const result = await noteModel.createUserNote(1, 'Test Note', 'This is a test note');
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('title', 'Test Note');
            expect(result).toHaveProperty('content', 'This is a test note');
            expect(result).toHaveProperty('created_at');
            expect(result).toHaveProperty('updated_at');
            testNoteId = result.id;
        });
    });

    describe('Fail to create a note', () => {
        it('should return an error', async () => {
            try {
                await noteModel.createUserNote(999, 'Test Note', 'This is a test note');
                fail('Expected an error to be thrown');
            } catch (error) {
                expect(error.message).toBe('User does not exist');
            }
        });
    });

    // Tests to update a note
    describe('Update a note successfully', () => {
        it('should return the updated note', async () => {
            const result = await noteModel.updateUserNote(1, testNoteId, 'Updated Note', 'This is an updated note, search this: Raven');
            expect(result).toHaveProperty('id', testNoteId);
            expect(result).toHaveProperty('title', 'Updated Note');
            expect(result).toHaveProperty('content', 'This is an updated note, search this: Raven');
            expect(result).toHaveProperty('updated_at');
        });
    });

    describe('Fail to update a note', () => {
        it('should return an error', async () => {
           try { await noteModel.updateUserNote(999, testNoteId, 'Updated Note', 'This is an updated note');
                fail('Expected an error to be thrown');
            } catch (error) {
                expect(error.message).toBe('User does not exist');
            }
        });
    });

    // Tests to share a note
    describe('Share a note successfully', () => {
        it('should return the shared note', async () => {
            const result = await noteModel.shareUserNote(1, testNoteId, 2);
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('note_id', testNoteId);
            expect(result).toHaveProperty('shared_with', 2);
            expect(result).toHaveProperty('shared_by', 1);
            expect(result).toHaveProperty('created_at');
        });
    });

    describe('Fail to share a note', () => {
        it('should return an error', async () => {
            try { await noteModel.shareUserNote(999, testNoteId, 2);
                fail('Expected an error to be thrown');
            } catch (error) {
                expect(error.message).toBe('User does not exist');
            }
        });
    });

    // Tests to search for a note
    describe('Search for a note by title successfully', () => {
        it('should return the searched note', async () => {
            const result = await noteModel.searchUserNotes(1, 'Updated Note');
            expect(result).toHaveLength(1);
            result.forEach(note => {
                expect(note).toHaveProperty('id');
                expect(note).toHaveProperty('title', 'Updated Note');
                expect(note).toHaveProperty('content');
                expect(note).toHaveProperty('created_at');
                expect(note).toHaveProperty('updated_at');
            });
        });
    });

    describe('Search for a note by content successfully', () => {
        it('should return the searched note', async () => {
            const result = await noteModel.searchUserNotes(1, 'Raven');
            expect(result).toHaveLength(1);
            result.forEach(note => {
                expect(note).toHaveProperty('id');
                expect(note).toHaveProperty('title');
                expect(note).toHaveProperty('content', 'This is an updated note, search this: Raven');
                expect(note).toHaveProperty('created_at');
                expect(note).toHaveProperty('updated_at');
            });
        });
    });

    describe('Fail to search for a note', () => {
        it('should return an error', async () => {
            try { await noteModel.searchUserNotes(1, 'Failed Note');
                fail('Expected an error to be thrown');
            } catch (error) {
                expect(error.message).toBe('Note not found');
            }
        });
    });

    describe('Fail to search for a other users non-shared notes', () => {
        it('should return an error', async () => {
            try { await noteModel.searchUserNotes(3, 'Updated Note');
                fail('Expected an error to be thrown');
            } catch (error) {
                expect(error.message).toBe('Note not found');
            }
        });
    });

    // Tests to delete a note
    describe('Delete test note successfully', () => {
        it('should successfully delete the test note', async () => {
            const result = await noteModel.deleteUserNote(1, testNoteId);
            expect(result.id).toBe(testNoteId);
            const checkNote = await noteModel.getUsersNotes(1);
            expect(checkNote).toHaveLength(1);
        });
    });

    describe('Fail to delete a note', () => {
        it('should return an error', async () => {
            try { await noteModel.deleteUserNote(999, 1);
                fail('Expected an error to be thrown');
            } catch (error) {
                expect(error.message).toBe('User does not exist');
            }
        });
    });
});