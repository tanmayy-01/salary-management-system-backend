const { StatusCodes } = require('http-status-codes');
const { UserService } = require('../services');
const { successResponse, errorResponse } = require('../utils');

const signin = async (req, res) => {
    try {
        const response = await UserService.signin({
            email: req.body.email,
            password: req.body.password,
            role: req.body.role
        });

        return res
            .status(StatusCodes.OK)
            .json(successResponse('Successfully signed in', response));
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse(error.message, error.explanation || error));
    }
};

const signup = async (req, res) => {
    try {
        const response = await UserService.signup({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            role_name: req.body.role || req.body.role_name
        });

        return res
            .status(StatusCodes.CREATED)
            .json(successResponse('Successfully registered new user', response));
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse(error.message, error.explanation || error));
    }
};

const getProfile = async (req, res) => {
    try {
        const response = await UserService.getProfile(req.user.id);
        return res
            .status(StatusCodes.OK)
            .json(successResponse('Successfully retrieved user profile', response));
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse(error.message, error.explanation || error));
    }
};

module.exports = {
    signin,
    signup,
    getProfile
};
