const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT token
exports.authenticate = (req, res, next) => {
    // Get token from header - support both Authorization Bearer and x-auth-token
    // Try multiple methods to get headers (case-insensitive)
    let token = req.header('x-auth-token') || 
                req.get('x-auth-token') || 
                req.headers['x-auth-token'] ||
                req.headers['X-Auth-Token'];
    
    // If not found, try Authorization Bearer header
    if (!token) {
        const authHeader = req.header('Authorization') || 
                          req.get('Authorization') || 
                          req.headers['authorization'] ||
                          req.headers['Authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7); // Remove 'Bearer ' prefix
        }
    }

    console.log('=== AUTHENTICATION MIDDLEWARE ===');
    console.log('Request URL:', req.originalUrl);
    console.log('Request method:', req.method);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Token found:', !!token);
    console.log('Token (first 20 chars):', token ? token.substring(0, 20) + '...' : 'N/A');

    // Check if no token
    if (!token) {
        console.error('No token provided');
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        console.log('Token decoded successfully:', { userId: decoded.userId, email: decoded.email, role: decoded.role });
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification failed:', err.message);
        res.status(401).json({ message: 'Token is not valid', error: err.message });
    }
};

// Middleware to check if user is an admin
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
};

// Middleware to check if user is an instructor
exports.isInstructor = (req, res, next) => {
    if (req.user && req.user.role === 'instructor') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Instructor privileges required.' });
    }
};

// Middleware to check if user is a student
exports.isStudent = (req, res, next) => {
    if (req.user && req.user.role === 'student') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Student privileges required.' });
    }
};
