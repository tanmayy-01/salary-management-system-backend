const { EmployeeRepository, AttendanceRepository, LeaveRepository } = require('../repositories');
const { AppError, getWorkingDaysInMonth, getMonthDateRange } = require('../utils');
const { StatusCodes } = require('http-status-codes');

const employeeRepository = new EmployeeRepository();
const attendanceRepository = new AttendanceRepository();
const leaveRepository = new LeaveRepository();

/**
 * Returns Admin Dashboard metrics:
 * - Total employees
 * - For each employee: Days attended in selected month, total working days, attendance percentage
 * - Month & year filter support
 */
const getAdminDashboardStats = async ({ month, year } = {}) => {
    try {
        const currentDate = new Date();
        const selectedYear = year ? parseInt(year, 10) : currentDate.getFullYear();
        const selectedMonth = month ? parseInt(month, 10) : currentDate.getMonth() + 1;

        const totalWorkingDays = getWorkingDaysInMonth(selectedYear, selectedMonth);
        const { startDate, endDate } = getMonthDateRange(selectedYear, selectedMonth);

        // Fetch all employees with User relation
        const { count: totalEmployees, rows: employees } = await employeeRepository.getAllEmployeesWithDetails();

        // Calculate attendance metrics for each employee
        const employeeAttendanceStats = await Promise.all(
            employees.map(async (emp) => {
                const attendedDays = await attendanceRepository.countAttendedDays(emp.id, startDate, endDate);
                const attendancePercentage = Number(((attendedDays / totalWorkingDays) * 100).toFixed(2));
                const approvedLeaves = await leaveRepository.countLeavesByStatus(emp.id, 'approved', startDate, endDate);

                return {
                    employeeId: emp.id,
                    name: emp.user ? emp.user.name : 'Unknown',
                    email: emp.user ? emp.user.email : 'Unknown',
                    mobile: emp.mobile,
                    baseSalary: emp.base_salary,
                    daysAttended: attendedDays,
                    totalWorkingDays: totalWorkingDays,
                    attendancePercentage: attendancePercentage,
                    approvedLeaves: approvedLeaves
                };
            })
        );

        // Overall summary
        const totalPendingLeaves = await leaveRepository.countLeavesByStatus(null, 'pending');

        return {
            selectedMonth,
            selectedYear,
            totalEmployees,
            totalWorkingDaysInMonth: totalWorkingDays,
            totalPendingLeaves,
            employees: employeeAttendanceStats
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(error.message || 'Unable to load admin dashboard stats', StatusCodes.INTERNAL_SERVER_ERROR);
    }
};

/**
 * Returns Employee Dashboard metrics:
 * - Profile summary
 * - Today's check-in status
 * - Current month attendance percentage
 * - Recent attendance and recent leaves
 */
const getEmployeeDashboardSummary = async (userId, { month, year } = {}) => {
    try {
        const employee = await employeeRepository.getEmployeeByUserId(userId);
        if (!employee) {
            throw new AppError('Employee profile not found for this user account', StatusCodes.NOT_FOUND);
        }

        const currentDate = new Date();
        const selectedYear = year ? parseInt(year, 10) : currentDate.getFullYear();
        const selectedMonth = month ? parseInt(month, 10) : currentDate.getMonth() + 1;

        const totalWorkingDays = getWorkingDaysInMonth(selectedYear, selectedMonth);
        const { startDate, endDate } = getMonthDateRange(selectedYear, selectedMonth);

        // Days attended and percentage in selected month
        const attendedDays = await attendanceRepository.countAttendedDays(employee.id, startDate, endDate);
        const attendancePercentage = Number(((attendedDays / totalWorkingDays) * 100).toFixed(2));

        // Today's attendance check
        const todayDateStr = currentDate.toISOString().split('T')[0];
        const todayAttendance = await attendanceRepository.getAttendanceByEmployeeAndDate(employee.id, todayDateStr);

        // Recent attendances and leaves
        const recentAttendances = await attendanceRepository.getAttendancesByEmployeeAndRange(employee.id, startDate, endDate);
        const recentLeaves = await leaveRepository.getLeavesByEmployee(employee.id, { startDate, endDate });

        return {
            employee: {
                id: employee.id,
                name: employee.user ? employee.user.name : '',
                email: employee.user ? employee.user.email : '',
                mobile: employee.mobile,
                baseSalary: employee.base_salary
            },
            selectedMonth,
            selectedYear,
            today: {
                date: todayDateStr,
                checkedIn: !!(todayAttendance && parseFloat(todayAttendance.working_hours) > 0),
                workingHours: todayAttendance ? todayAttendance.working_hours : 0.00,
                overtimeHours: todayAttendance ? todayAttendance.overtime_hours : 0.00
            },
            monthStats: {
                daysAttended: attendedDays,
                totalWorkingDays: totalWorkingDays,
                attendancePercentage: attendancePercentage
            },
            recentAttendances: recentAttendances.slice(0, 7),
            recentLeaves: recentLeaves.slice(0, 5)
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(error.message || 'Unable to load employee dashboard', StatusCodes.INTERNAL_SERVER_ERROR);
    }
};

module.exports = {
    getAdminDashboardStats,
    getEmployeeDashboardSummary
};
