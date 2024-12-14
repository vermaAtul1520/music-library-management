const mongoose = require('mongoose');
require('dotenv').config()

const uri =  process.env.MONGODB_URI;

const connectToDatabase = async () => {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB using Mongoose');
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        process.exit(1); // Exit the process if the connection fails
    }
};


const closeConnection = async () => {
    try {
        await mongoose.connection.close();
        console.log('Mongoose connection closed');
    } catch (error) {
        console.error('Error while closing the connection', error);
    }
};

module.exports = {
    connectToDatabase,
    closeConnection,
};
