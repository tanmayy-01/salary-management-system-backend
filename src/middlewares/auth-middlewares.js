const { StatusCodes } = require('http-status-codes');
const { verifyToken, errorResponse } = require('../utils');

const validateAuthRequest = (req, res, next) => {
    if (!req.body.email) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(errorResponse('Validation error', ['Email not found in the incoming request in the correct form']));
    }
    if (!req.body.password) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(errorResponse('Validation error', ['Password not found in the incoming request in the correct form']));
    }
    next();
};

const checkAuth = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'] || req.headers['x-access-token'];

        if (!authHeader) {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json(errorResponse('Authentication failed', ['Missing authentication token in request header']));
        }

        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

        if (!token) {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json(errorResponse('Authentication failed', ['Invalid token format, expected Bearer <token>']));
        }

        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json(errorResponse('Authentication failed', ['JWT token has expired']));
        }
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json(errorResponse('Authentication failed', ['Invalid authentication token']));
    }
};

/**
 * Role-based authorization middleware
 * @param  {...string} allowedRoles Roles permitted to access the resource (e.g., 'admin', 'employee')
 */
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res
                .status(StatusCodes.FORBIDDEN)
                .json(errorResponse('Access forbidden', ['User role is not defined or user is unauthenticated']));
        }

        const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());
        const userRole = req.user.role.toLowerCase();

        if (!normalizedAllowed.includes(userRole)) {
            return res
                .status(StatusCodes.FORBIDDEN)
                .json(errorResponse('Access forbidden', [
                    `Role '${req.user.role}' is not authorized to access this resource. Allowed roles: ${allowedRoles.join(', ')}`
                ]));
        }

        next();
    };
};

module.exports = {
    validateAuthRequest,
    checkAuth,
    checkRole
};
