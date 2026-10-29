const { StatusCodes } = require('http-status-codes');
const { SalaryService } = require('../services');
const { successResponse, errorResponse } = require('../utils');

const generateSalary = async (req, res) => {
    try {
        const { employee_id, month, year } = req.body;

        if (employee_id) {
            // Generate for single employee
            const response = await SalaryService.calculateSalaryForEmployee(employee_id, month, year);
            return res
                .status(StatusCodes.CREATED)
                .json(successResponse('Salary calculated and processed successfully', response));
        }

        // Generate in bulk for all employees
        const response = await SalaryService.generateSalariesForAllEmployees(month, year);
        return res
            .status(StatusCodes.OK)
            .json(successResponse('Bulk salary calculation completed', response));
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse(error.message, error.explanation || error));
    }
};

const getAllSalaries = async (req, res) => {
    try {
        const response = await SalaryService.getAllSalaries({
            month: req.query.month,
            year: req.query.year,
            page: req.query.page,
            limit: req.query.limit
        });
        return res
            .status(StatusCodes.OK)
            .json(successResponse('Successfully fetched salaries list', response));
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse(error.message, error.explanation || error));
    }
};

const getMySalaries = async (req, res) => {
    try {
        const response = await SalaryService.getMySalaries(req.user.id, {
            year: req.query.year
        });
        return res
            .status(StatusCodes.OK)
            .json(successResponse('Successfully fetched my salary records', response));
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(errorResponse(error.message, error.explanation || error));
    }
};

module.exports = {
    generateSalary,
    getAllSalaries,
    getMySalaries
};
