const { AttendanceRepository, EmployeeRepository } = require('../repositories');
const { AppError, getWorkingDaysInMonth, getMonthDateRange } = require('../utils');
const { StatusCodes } = require('http-status-codes');

const attendanceRepository = new AttendanceRepository();
const employeeRepository = new EmployeeRepository();

const logAttendance = async (userId, data) => {
    try {
        const employee = await employeeRepository.getEmployeeByUserId(userId);
        if (!employee) {
            throw new AppError('Employee profile not found for this user', StatusCodes.NOT_FOUND);
        }

        const { date, working_hours, overtime_hours = 0.00 } = data;

        if (!date || working_hours === undefined) {
            throw new AppError('Date and working_hours are required', StatusCodes.BAD_REQUEST);
        }

        const parsedHours = parseFloat(working_hours);
        const parsedOvertime = parseFloat(overtime_hours);

        if (isNaN(parsedHours) || parsedHours < 0 || parsedHours > 24) {
            throw new AppError('Working hours must be a number between 0 and 24', StatusCodes.BAD_REQUEST);
        }

        if (isNaN(parsedOvertime) || parsedOvertime < 0 || parsedOvertime > 24) {
            throw new AppError('Overtime hours must be a number between 0 and 24', StatusCodes.BAD_REQUEST);
        }

        const record = await attendanceRepository.upsertAttendance({
            employee_id: employee.id,
            date,
            working_hours: parsedHours,
            overtime_hours: parsedOvertime
        });

        return record;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(error.message || 'Unable to log attendance', StatusCodes.INTERNAL_SERVER_ERROR);
    }
};

const getMyAttendance = async (userId, { month, year }) => {
    try {
        const employee = await employeeRepository.getEmployeeByUserId(userId);
        if (!employee) {
            throw new AppError('Employee profile not found', StatusCodes.NOT_FOUND);
        }

        const currentYear = year ? parseInt(year, 10) : new Date().getFullYear();
        const currentMonth = month ? parseInt(month, 10) : new Date().getMonth() + 1;

        const { startDate, endDate } = getMonthDateRange(currentYear, currentMonth);
        const records = await attendanceRepository.getAttendancesByEmployeeAndRange(employee.id, startDate, endDate);

        const daysAttended = records.filter(r => parseFloat(r.working_hours) > 0).length;
        const totalWorkingDays = getWorkingDaysInMonth(currentYear, currentMonth);
        const attendancePercentage = Number(((daysAttended / totalWorkingDays) * 100).toFixed(2));
        const totalHours = records.reduce((sum, r) => sum + parseFloat(r.working_hours || 0), 0);
        const totalOvertime = records.reduce((sum, r) => sum + parseFloat(r.overtime_hours || 0), 0);

        return {
            employeeId: employee.id,
            month: currentMonth,
            year: currentYear,
            daysAttended,
            totalWorkingDays,
            attendancePercentage,
            totalHoursWorked: Number(totalHours.toFixed(2)),
            totalOvertimeHours: Number(totalOvertime.toFixed(2)),
            records
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(error.message || 'Unable to fetch attendance', StatusCodes.INTERNAL_SERVER_ERROR);
    }
};

const getEmployeeAttendance = async (employeeId, { month, year }) => {
    try {
        const employee = await employeeRepository.get(employeeId);
        if (!employee) {
            throw new AppError('Employee not found', StatusCodes.NOT_FOUND);
        }

        const currentYear = year ? parseInt(year, 10) : new Date().getFullYear();
        const currentMonth = month ? parseInt(month, 10) : new Date().getMonth() + 1;

        const { startDate, endDate } = getMonthDateRange(currentYear, currentMonth);
        const records = await attendanceRepository.getAttendancesByEmployeeAndRange(employeeId, startDate, endDate);

        const daysAttended = records.filter(r => parseFloat(r.working_hours) > 0).length;
        const totalWorkingDays = getWorkingDaysInMonth(currentYear, currentMonth);
        const attendancePercentage = Number(((daysAttended / totalWorkingDays) * 100).toFixed(2));

        return {
            employeeId: parseInt(employeeId, 10),
            month: currentMonth,
            year: currentYear,
            daysAttended,
            totalWorkingDays,
            attendancePercentage,
            records
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(error.message || 'Unable to retrieve employee attendance', StatusCodes.INTERNAL_SERVER_ERROR);
    }
};

const getAllAttendance = async ({ month, year }) => {
    try {
        const currentYear = year ? parseInt(year, 10) : new Date().getFullYear();
        const currentMonth = month ? parseInt(month, 10) : new Date().getMonth() + 1;

        const { startDate, endDate } = getMonthDateRange(currentYear, currentMonth);
        const records = await attendanceRepository.getAllAttendancesInRange(startDate, endDate);

        return {
            month: currentMonth,
            year: currentYear,
            totalRecords: records.length,
            records
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(error.message || 'Unable to fetch all attendance', StatusCodes.INTERNAL_SERVER_ERROR);
    }
};

module.exports = {
    logAttendance,
    getMyAttendance,
    getEmployeeAttendance,
    getAllAttendance
};
