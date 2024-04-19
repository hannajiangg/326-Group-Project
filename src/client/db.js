// Import PouchDB library if you're using modules
import PouchDB from 'pouchdb';

// Initialize PouchDB instance
const db = new PouchDB('users');

// Define createUser function
async function createUser(userData) {
    try {
        // Insert the user document into the database
        const response = await db.post(userData);
        console.log('User added to database:', response);
        return response;
    } catch (error) {
        throw new Error('Failed to create user:', error);
    }
}

// Define getUserByEmail function
async function getUserByEmail(email) {
    try {
        // Query the database for the user document with the specified email
        const result = await db.find({
            selector: { email: email },
            limit: 1
        });
        if (result.docs.length > 0) {
            return result.docs[0];
        } else {
            return null; // User not found
        }
    } catch (error) {
        throw new Error('Failed to get user by email:', error);
    }
}

// Export the functions for use in other files
export { createUser, getUserByEmail };
