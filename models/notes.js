// model for notes

const pool = require('../db/db');

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
}

// Update Note for User
const updateUserNote = async (userId, noteId, title, content) => {
}

// Delete Note for User
const deleteUserNote = async (userId, noteId) => {
}

// Share Note with User
const shareUserNote = async (userId, noteId, sharedWith) => {
}

// Search Notes for User
const searchUserNotes = async (userId, searchTerm) => {
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