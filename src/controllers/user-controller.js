const { StatusCodes } = require('http-status-codes');
const { UserService } = require('../services');
const { successResponse, errorResponse } = require('../utils');


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
    getProfile
};
