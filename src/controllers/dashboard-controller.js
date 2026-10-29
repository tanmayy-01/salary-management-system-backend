const { StatusCodes } = require('http-status-codes');
const { DashboardService } = require('../services');
const { successResponse, errorResponse } = require('../utils');

const getAdminDashboard = async (req, res) => {
    try {
        const response = await DashboardService.getAdminDashboardStats({
            month: req.query.month,
            year: req.query.year
        });
        return res
            .status(StatusCodes.OK)
            .json(successResponse('Successfully fetched admin dashboard data', response));
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse(error.message, error.explanation || error));
    }
};

const getEmployeeDashboard = async (req, res) => {
    try {
        const response = await DashboardService.getEmployeeDashboardSummary(req.user.id, {
            month: req.query.month,
            year: req.query.year
        });
        return res
            .status(StatusCodes.OK)
            .json(successResponse('Successfully fetched employee dashboard data', response));
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse(error.message, error.explanation || error));
    }
};

module.exports = {
    getAdminDashboard,
    getEmployeeDashboard
};
