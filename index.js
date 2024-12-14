const express = require('express');
const { connectToDatabase, closeConnection } = require('./src/config/mongoConnection');
const {protect} = require('./src/middleware/authMiddleware')
require('dotenv').config()
const PORT = process.env.PORT;
const app = express();

app.use(express.json());

// attaching middleware globaly for all api and hanlde the exclusion of /login and
app.use(protect);


// Start the server and connect to the database
const startServer = async () => {
    try {
        await connectToDatabase();

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server', error);
    }
};

startServer();

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('Gracefully shutting down...');
    await closeConnection();
    process.exit(0);
});