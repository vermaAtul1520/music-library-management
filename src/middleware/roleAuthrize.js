const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            const user = req.user; // Assumes `req.user` contains user info after authentication

            if (!user) {
                return res.status(401).json({ message: 'Unauthorized: No user data' });
            }

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({ message: 'Forbidden: You do not have access' });
            }

            next(); // User is authorized, proceed to the next middleware or route handler
        } catch (error) {
            console.error('Authorization error:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };
};

module.exports = authorize;
