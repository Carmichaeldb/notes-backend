// model for notes

const pool = require('../db/db');

// User Check
const checkUser = async (userId) => {
    const result = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
        throw new Error('User does not exist');
    }
}

// Get Users Notes
const getUsersNotes = async (userId) => {
    try {
        const result = await pool.query('SELECT * FROM notes WHERE user_id = $1', [userId]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching user notes:', error);
        throw error;
    }
}

// Get Shared Notes for User
const getSharedNotes = async (userId) => {
    try {
        const result = await pool.query(`SELECT notes.*, 
            shared_notes.shared_by, 
            shared_notes.created_at as shared_at,
            users.username as shared_by_username
            FROM notes 
            JOIN shared_notes ON notes.id = shared_notes.note_id 
            JOIN users ON shared_notes.shared_by = users.id
            WHERE shared_notes.shared_with = $1`, [userId]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching shared notes:', error);
        throw error;
    }
}

// Create Note for User
const createUserNote = async (userId, title, content) => {
    try {
        await checkUser(userId);

        const result = await pool.query('INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3) RETURNING *', [userId, title, content]);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating user note:', error);
        throw error;
    }
}

// Update Note for User
const updateUserNote = async (userId, noteId, title, content) => {
    try {
        await checkUser(userId);

        const result = await pool.query('UPDATE notes SET title = $1, content = $2 WHERE id = $3 AND user_id = $4 RETURNING *', [title, content, noteId, userId]);
        return result.rows[0];
    } catch (error) {
        console.error('Error updating user note:', error);
        throw error;
    }
}

// Delete Note for User
const deleteUserNote = async (userId, noteId) => { 
    try {
        await checkUser(userId);

        const result = await pool.query('DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING *', [noteId, userId]);
        return result.rows[0];
    } catch (error) {
        console.error('Error deleting user note:', error);
        throw error;
    }
}

// Share Note with User
const shareUserNote = async (userId, noteId, sharedWith) => {
    try {
        await checkUser(userId);

        const result = await pool.query('INSERT INTO shared_notes (note_id, shared_by, shared_with) VALUES ($1, $2, $3) RETURNING *', [noteId, userId, sharedWith]);
        return result.rows[0];
    } catch (error) {
        console.error('Error sharing user note:', error);
        throw error;
    }
}

// Search Notes for User
const searchUserNotes = async (userId, searchTerm) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT notes.* 
            FROM notes 
            LEFT JOIN shared_notes ON notes.id = shared_notes.note_id
            WHERE (notes.user_id = $1 OR shared_notes.shared_with = $1)
            AND (title ILIKE $2 OR content ILIKE $2)
            ORDER BY notes.created_at DESC`,
            [userId, `%${searchTerm}%`]
        );
        if (result.rows.length === 0) {
            throw new Error('Note not found');
        }
        return result.rows;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getUsersNotes,
    getSharedNotes,
    createUserNote,
    updateUserNote,
    deleteUserNote,
    shareUserNote,
    searchUserNotes
};