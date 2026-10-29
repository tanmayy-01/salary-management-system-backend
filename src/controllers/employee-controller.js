const { StatusCodes } = require('http-status-codes');
const { EmployeeService } = require('../services');
const { successResponse, errorResponse } = require('../utils');

const getAllEmployees = async (req, res) => {
    try {
        const response = await EmployeeService.getAllEmployees({
            search: req.query.search,
            page: req.query.page,
            limit: req.query.limit
        });
        return res
            .status(StatusCodes.OK)
            .json(successResponse('Successfully fetched employees list', response));
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse(error.message, error.explanation || error));
    }
};

const getEmployeeById = async (req, res) => {
    try {
        const response = await EmployeeService.getEmployeeById(req.params.id);
        return res
            .status(StatusCodes.OK)
            .json(successResponse('Successfully fetched employee details', response));
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse(error.message, error.explanation || error));
    }
};

const createEmployee = async (req, res) => {
    try {
        const response = await EmployeeService.createEmployee(req.body);
        return res
            .status(StatusCodes.CREATED)
            .json(successResponse('Successfully created employee', response));
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse(error.message, error.explanation || error));
    }
};

const updateEmployee = async (req, res) => {
    try {
        const response = await EmployeeService.updateEmployee(req.params.id, req.body);
        return res
            .status(StatusCodes.OK)
            .json(successResponse('Successfully updated employee', response));
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse(error.message, error.explanation || error));
    }
};

const deleteEmployee = async (req, res) => {
    try {
        const response = await EmployeeService.deleteEmployee(req.params.id);
        return res
            .status(StatusCodes.OK)
            .json(successResponse('Successfully deleted employee', response));
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse(error.message, error.explanation || error));
    }
};

module.exports = {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
};
