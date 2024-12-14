const createResponse = require('../utils/createResponse');

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            const user = req.user;

            if (!user) {
                return res.status(401).json(createResponse(401, null, 'Unauthorized: No user data', null));
            }

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json(createResponse(403, null, 'Forbidden: You do not have access', null));
            }

            next();
        } catch (error) {
            console.error('Authorization error:', error);
            res.status(500).json(createResponse(500, null, 'Internal Server Error', error.message));
        }
    };
};

module.exports = authorize;
