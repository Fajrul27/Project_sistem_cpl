// ============================================
// JWT Authentication Middleware
// ============================================
import jwt from 'jsonwebtoken';
export const authMiddleware = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized - No token provided' });
        }
        const token = authHeader.split(' ')[1];
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        // Attach user info to request
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        req.userRole = decoded.role;
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
};
export const requireRole = (...roles) => {
    return (req, res, next) => {
        const currentRole = req.userRole;
        if (!currentRole || !roles.includes(currentRole)) {
            return res.status(403).json({ error: 'Forbidden - Insufficient role' });
        }
        next();
    };
};
