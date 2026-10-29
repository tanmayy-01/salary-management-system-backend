const { UserRepository, RoleRepository } = require('../repositories');
const { AppError, comparePassword, hashPassword, generateToken } = require('../utils');
const { StatusCodes } = require('http-status-codes');

const userRepository = new UserRepository();
const roleRepository = new RoleRepository();

const signin = async (data) => {
    try {
        const { email, password, role } = data;

        if (!email || !password) {
            throw new AppError('Email and password are required', StatusCodes.BAD_REQUEST);
        }

        const user = await userRepository.getUserByEmail(email);
        if (!user) {
            throw new AppError('No registered account found with this email', StatusCodes.NOT_FOUND);
        }

        const isPasswordMatch = await comparePassword(password, user.password);
        if (!isPasswordMatch) {
            throw new AppError('Invalid email or password', StatusCodes.UNAUTHORIZED);
        }

        const userRole = user.role ? user.role.role_name : null;

        // Role-based login check: If role is explicitly provided, enforce matching role
        if (role && userRole && role.toLowerCase() !== userRole.toLowerCase()) {
            throw new AppError(
                `Access denied: You do not have permission to login as '${role}'`,
                StatusCodes.FORBIDDEN
            );
        }

        // Generate JWT token with user identity and role payload
        const jwtPayload = {
            id: user.id,
            email: user.email,
            role: userRole,
            role_id: user.role_id
        };

        const token = generateToken(jwtPayload);

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: userRole,
                employeeProfile: user.employeeProfile || null
            }
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(error.message || 'Cannot sign in user', StatusCodes.INTERNAL_SERVER_ERROR);
    }
};

const getProfile = async (userId) => {
    try {
        const user = await userRepository.getUserWithRole(userId);
        if (!user) {
            throw new AppError('User not found', StatusCodes.NOT_FOUND);
        }
        return user;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Unable to fetch user profile', StatusCodes.INTERNAL_SERVER_ERROR);
    }
};

const signup = async (data) => {
    try {
        const { name, email, password, role_name = 'employee' } = data;

        const existingUser = await userRepository.getUserByEmail(email);
        if (existingUser) {
            throw new AppError('User with this email already exists', StatusCodes.CONFLICT);
        }

        const role = await roleRepository.getRoleByName(role_name);
        if (!role) {
            throw new AppError(`Role '${role_name}' does not exist`, StatusCodes.BAD_REQUEST);
        }

        const hashedPassword = await hashPassword(password);
        const newUser = await userRepository.create({
            name,
            email,
            password: hashedPassword,
            role_id: role.id
        });

        return {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: role.role_name
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(error.message || 'Cannot register user', StatusCodes.INTERNAL_SERVER_ERROR);
    }
};

module.exports = {
    signin,
    getProfile,
    signup
};
