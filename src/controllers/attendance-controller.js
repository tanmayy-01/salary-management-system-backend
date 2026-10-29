const { StatusCodes } = require('http-status-codes');
const { AttendanceService } = require('../services');
const { successResponse, errorResponse } = require('../utils');

const logAttendance = async (req, res) => {
    try {
        const response = await AttendanceService.logAttendance(req.user.id, req.body);
        return res
            .status(StatusCodes.OK)
            .json(successResponse('Attendance logged successfully', response));
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse(error.message, error.explanation || error));
    }
};

const getMyAttendance = async (req, res) => {
    try {
        const response = await AttendanceService.getMyAttendance(req.user.id, {
            month: req.query.month,
            year: req.query.year
        });
        return res
            .status(StatusCodes.OK)
            .json(successResponse('Successfully fetched my attendance', response));
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse(error.message, error.explanation || error));
    }
};

const getEmployeeAttendance = async (req, res) => {
    try {
        const response = await AttendanceService.getEmployeeAttendance(req.params.employeeId, {
            month: req.query.month,
            year: req.query.year
        });
        return res
            .status(StatusCodes.OK)
            .json(successResponse('Successfully fetched employee attendance', response));
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse(error.message, error.explanation || error));
    }
};

const getAllAttendance = async (req, res) => {
    try {
        const response = await AttendanceService.getAllAttendance({
            month: req.query.month,
            year: req.query.year
        });
        return res
            .status(StatusCodes.OK)
            .json(successResponse('Successfully fetched all attendance records', response));
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse(error.message, error.explanation || error));
    }
};

module.exports = {
    logAttendance,
    getMyAttendance,
    getEmployeeAttendance,
    getAllAttendance
};
