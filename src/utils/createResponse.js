// utils/response.js

const createResponse = (status, data, message, error) => {
    return {
        status,
        data,
        message,
        error,
    };
};

module.exports = createResponse;
