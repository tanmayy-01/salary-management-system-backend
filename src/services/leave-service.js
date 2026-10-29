const { LeaveRepository, EmployeeRepository } = require('../repositories');
const { AppError, getMonthDateRange } = require('../utils');
const { StatusCodes } = require('http-status-codes');

const leaveRepository = new LeaveRepository();
const employeeRepository = new EmployeeRepository();

const applyLeave = async (userId, data) => {
    try {
        const employee = await employeeRepository.getEmployeeByUserId(userId);
        if (!employee) {
            throw new AppError('Employee profile not found for this user', StatusCodes.NOT_FOUND);
        }

        const { date, reason } = data;

        if (!date || !reason) {
            throw new AppError('Date and reason are required to apply for leave', StatusCodes.BAD_REQUEST);
        }

        const existingLeave = await leaveRepository.getLeaveByEmployeeAndDate(employee.id, date);
        if (existingLeave) {
            throw new AppError(`A leave request for ${date} has already been submitted (status: ${existingLeave.status})`, StatusCodes.CONFLICT);
        }

        const leave = await leaveRepository.create({
            employee_id: employee.id,
            date,
            reason,
            status: 'pending'
        });

        return leave;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(error.message || 'Unable to apply for leave', StatusCodes.INTERNAL_SERVER_ERROR);
    }
};

const getMyLeaves = async (userId, { status, month, year } = {}) => {
    try {
        const employee = await employeeRepository.getEmployeeByUserId(userId);
        if (!employee) {
            throw new AppError('Employee profile not found', StatusCodes.NOT_FOUND);
        }

        let startDate, endDate;
        if (month && year) {
            const range = getMonthDateRange(parseInt(year, 10), parseInt(month, 10));
            startDate = range.startDate;
            endDate = range.endDate;
        }

        const leaves = await leaveRepository.getLeavesByEmployee(employee.id, {
            status,
            startDate,
            endDate
        });

        return leaves;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(error.message || 'Unable to fetch your leaves', StatusCodes.INTERNAL_SERVER_ERROR);
    }
};

const getAllLeaves = async ({ status, month, year, page = 1, limit = 10 } = {}) => {
    try {
        let startDate, endDate;
        if (month && year) {
            const range = getMonthDateRange(parseInt(year, 10), parseInt(month, 10));
            startDate = range.startDate;
            endDate = range.endDate;
        }

        const offset = (page - 1) * limit;
        const { count, rows } = await leaveRepository.getAllLeaves({
            status,
            startDate,
            endDate,
            limit,
            offset
        });

        return {
            totalLeaves: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page, 10),
            leaves: rows
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(error.message || 'Unable to fetch leaves list', StatusCodes.INTERNAL_SERVER_ERROR);
    }
};

const updateLeaveStatus = async (leaveId, { status }) => {
    try {
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            throw new AppError("Status must be one of: 'pending', 'approved', 'rejected'", StatusCodes.BAD_REQUEST);
        }

        return await leaveRepository.update(leaveId, { status });
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(error.message || 'Unable to update leave status', StatusCodes.INTERNAL_SERVER_ERROR);
    }
};

module.exports = {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    updateLeaveStatus
};
