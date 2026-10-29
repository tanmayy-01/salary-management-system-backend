const {
    SalaryRepository,
    EmployeeRepository,
    AttendanceRepository,
    LeaveRepository
} = require('../repositories');
const { AppError, getMonthDateRange } = require('../utils');
const { StatusCodes } = require('http-status-codes');

const salaryRepository = new SalaryRepository();
const employeeRepository = new EmployeeRepository();
const attendanceRepository = new AttendanceRepository();
const leaveRepository = new LeaveRepository();

/**
 * Returns previous month and year relative to a given date
 * @param {Date} referenceDate
 * @returns {{ month: number, year: number }}
 */
const getPreviousMonthAndYear = (referenceDate = new Date()) => {
    let month = referenceDate.getMonth(); // 0 = Jan (so 0 corresponds to December of previous year)
    let year = referenceDate.getFullYear();
    if (month === 0) {
        month = 12;
        year -= 1;
    }
    return { month, year };
};

/**
 * Calculates and inserts salary for a specific employee for a given month and year.
 * Prevents duplicate entries: throws 'Salary already processed for this selected month.'
 */
const calculateSalaryForEmployee = async (employeeId, month, year) => {
    try {
        const parsedMonth = parseInt(month, 10);
        const parsedYear = parseInt(year, 10);

        if (!employeeId || isNaN(parsedMonth) || isNaN(parsedYear)) {
            throw new AppError('Employee ID, valid month (1-12), and valid year are required', StatusCodes.BAD_REQUEST);
        }

        // 1. Prevent Duplicate Salary Entries
        const existingSalary = await salaryRepository.getSalaryByEmployeeAndMonthYear(employeeId, parsedMonth, parsedYear);
        if (existingSalary) {
            throw new AppError('Salary already processed for this selected month.', StatusCodes.CONFLICT);
        }

        // 2. Fetch Employee Profile
        const employee = await employeeRepository.get(employeeId);
        if (!employee) {
            throw new AppError('Employee not found', StatusCodes.NOT_FOUND);
        }
        const base_salary = parseFloat(employee.base_salary);

        // 3. Fetch previous/selected month attendance records
        const { startDate, endDate } = getMonthDateRange(parsedYear, parsedMonth);
        const attendanceRecords = await attendanceRepository.getAttendancesByEmployeeAndRange(employeeId, startDate, endDate);

        // 4. Calculate total_working_days (number of days employee was present with working_hours > 0)
        const total_working_days = attendanceRecords.filter(r => parseFloat(r.working_hours) > 0).length;

        // 5. Calculate total_leave_taken (number of approved leaves in that month)
        const total_leave_taken = await leaveRepository.countLeavesByStatus(employeeId, 'approved', startDate, endDate);

        // 6. Calculate total overtime hours submitted by the employee in that month
        const overtime = attendanceRecords.reduce((sum, r) => sum + parseFloat(r.overtime_hours || 0), 0);

        // 7. Calculate total salary using user-specified formula:
        // Total_salary = (Base_salary / total_working_days) * (total_working_days - total_leave_taken) + (overtime / 8)
        let total_salary_made = 0.00;
        if (total_working_days > 0) {
            const payableDays = Math.max(0, total_working_days - total_leave_taken);
            const baseComponent = (base_salary / total_working_days) * payableDays;
            const overtimeComponent = overtime / 8;
            total_salary_made = Number((baseComponent + overtimeComponent).toFixed(2));
        } else if (overtime > 0) {
            total_salary_made = Number((overtime / 8).toFixed(2));
        }

        // 8. Insert new record into Salaries table
        const newSalary = await salaryRepository.create({
            employee_id: employeeId,
            month: parsedMonth,
            year: parsedYear,
            total_working_days,
            total_leave_taken,
            overtime: Number(overtime.toFixed(2)),
            total_salary_made
        });

        return newSalary;
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new AppError('Salary already processed for this selected month.', StatusCodes.CONFLICT);
        }
        if (error instanceof AppError) throw error;
        throw new AppError(error.message || 'Unable to calculate salary', StatusCodes.INTERNAL_SERVER_ERROR);
    }
};

/**
 * Calculates salary for all active employees for a given month and year (used by Cron Job and Admin API)
 */
const generateSalariesForAllEmployees = async (month, year) => {
    try {
        const { rows: employees } = await employeeRepository.getAllEmployeesWithDetails();
        const results = [];
        const skipped = [];
        const errors = [];

        for (const emp of employees) {
            try {
                // Check if already processed
                const existing = await salaryRepository.getSalaryByEmployeeAndMonthYear(emp.id, month, year);
                if (existing) {
                    skipped.push({
                        employeeId: emp.id,
                        name: emp.user ? emp.user.name : 'Unknown',
                        reason: 'Salary already processed for this selected month.'
                    });
                    continue;
                }

                const salaryRecord = await calculateSalaryForEmployee(emp.id, month, year);
                results.push({
                    employeeId: emp.id,
                    name: emp.user ? emp.user.name : 'Unknown',
                    totalSalaryMade: salaryRecord.total_salary_made,
                    status: 'success'
                });
            } catch (err) {
                errors.push({
                    employeeId: emp.id,
                    name: emp.user ? emp.user.name : 'Unknown',
                    error: err.message
                });
            }
        }

        return {
            month: parseInt(month, 10),
            year: parseInt(year, 10),
            totalEmployees: employees.length,
            processedCount: results.length,
            skippedCount: skipped.length,
            errorCount: errors.length,
            results,
            skipped,
            errors
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(error.message || 'Failed to process bulk salaries', StatusCodes.INTERNAL_SERVER_ERROR);
    }
};

const getAllSalaries = async ({ month, year, page = 1, limit = 10 } = {}) => {
    try {
        const offset = (page - 1) * limit;
        const { count, rows } = await salaryRepository.getAllSalaries({
            month,
            year,
            limit,
            offset
        });

        return {
            totalRecords: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page, 10),
            salaries: rows
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(error.message || 'Unable to fetch salaries list', StatusCodes.INTERNAL_SERVER_ERROR);
    }
};

const getMySalaries = async (userId, { year } = {}) => {
    try {
        const employee = await employeeRepository.getEmployeeByUserId(userId);
        if (!employee) {
            throw new AppError('Employee profile not found', StatusCodes.NOT_FOUND);
        }

        const salaries = await salaryRepository.getSalariesByEmployee(employee.id, { year });
        return salaries;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(error.message || 'Unable to fetch your salary history', StatusCodes.INTERNAL_SERVER_ERROR);
    }
};

module.exports = {
    getPreviousMonthAndYear,
    calculateSalaryForEmployee,
    generateSalariesForAllEmployees,
    getAllSalaries,
    getMySalaries
};
