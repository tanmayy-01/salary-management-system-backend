const { StatusCodes } = require('http-status-codes');
const { LeaveService } = require('../services');
const { successResponse, errorResponse } = require('../utils');

const applyLeave = async (req, res) => {
    try {
        const response = await LeaveService.applyLeave(req.user.id, req.body);
        return res
            .status(StatusCodes.CREATED)
            .json(successResponse('Leave application submitted successfully', response));
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse(error.message, error.explanation || error));
    }
};

const getMyLeaves = async (req, res) => {
    try {
        const response = await LeaveService.getMyLeaves(req.user.id, {
            status: req.query.status,
            month: req.query.month,
            year: req.query.year
        });
        return res
            .status(StatusCodes.OK)
            .json(successResponse('Successfully fetched my leave applications', response));
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse(error.message, error.explanation || error));
    }
};

const getAllLeaves = async (req, res) => {
    try {
        const response = await LeaveService.getAllLeaves({
            status: req.query.status,
            month: req.query.month,
            year: req.query.year,
            page: req.query.page,
            limit: req.query.limit
        });
        return res
            .status(StatusCodes.OK)
            .json(successResponse('Successfully fetched all leave requests', response));
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse(error.message, error.explanation || error));
    }
};

const updateLeaveStatus = async (req, res) => {
    try {
        const response = await LeaveService.updateLeaveStatus(req.params.id, req.body);
        return res
            .status(StatusCodes.OK)
            .json(successResponse('Leave status updated successfully', response));
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse(error.message, error.explanation || error));
    }
};

module.exports = {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    updateLeaveStatus
};
