const { EmployeeRepository, UserRepository, RoleRepository } = require('../repositories');
const { AppError, hashPassword } = require('../utils');
const { StatusCodes } = require('http-status-codes');
const db = require('../models');

const employeeRepository = new EmployeeRepository();
const userRepository = new UserRepository();
const roleRepository = new RoleRepository();

const getAllEmployees = async ({ search, page = 1, limit = 10 } = {}) => {
    try {
        const offset = (page - 1) * limit;
        const { count, rows } = await employeeRepository.getAllEmployeesWithDetails({ search, limit, offset });
        return {
            totalEmployees: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page, 10),
            employees: rows
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Unable to retrieve employees', StatusCodes.INTERNAL_SERVER_ERROR);
    }
};

const getEmployeeById = async (id) => {
    try {
        const employee = await employeeRepository.getEmployeeWithRelations(id);
        if (!employee) {
            throw new AppError('Employee not found', StatusCodes.NOT_FOUND);
        }
        return employee;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Unable to retrieve employee details', StatusCodes.INTERNAL_SERVER_ERROR);
    }
};

const createEmployee = async (data) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { name, email, password, mobile, address, base_salary } = data;

        if (!name || !email || !password || !mobile || !address || base_salary === undefined) {
            throw new AppError('All fields (name, email, password, mobile, address, base_salary) are required', StatusCodes.BAD_REQUEST);
        }

        const existingUser = await userRepository.getUserByEmail(email);
        if (existingUser) {
            throw new AppError('An account with this email already exists', StatusCodes.CONFLICT);
        }

        const employeeRole = await roleRepository.getRoleByName('employee');
        if (!employeeRole) {
            throw new AppError('Employee role configuration not found', StatusCodes.INTERNAL_SERVER_ERROR);
        }

        const hashedPassword = await hashPassword(password);
        const user = await userRepository.create({
            name,
            email,
            password: hashedPassword,
            role_id: employeeRole.id
        }, { transaction });

        const employee = await employeeRepository.create({
            user_id: user.id,
            mobile,
            address,
            base_salary
        }, { transaction });

        await transaction.commit();

        return await employeeRepository.getEmployeeByUserId(user.id);
    } catch (error) {
        await transaction.rollback();
        if (error instanceof AppError) throw error;
        throw new AppError(error.message || 'Cannot create employee', StatusCodes.INTERNAL_SERVER_ERROR);
    }
};

const updateEmployee = async (id, data) => {
    try {
        const employee = await employeeRepository.get(id);
        if (!employee) {
            throw new AppError('Employee not found', StatusCodes.NOT_FOUND);
        }

        const { mobile, address, base_salary, name } = data;
        const employeeUpdates = {};
        if (mobile !== undefined) employeeUpdates.mobile = mobile;
        if (address !== undefined) employeeUpdates.address = address;
        if (base_salary !== undefined) employeeUpdates.base_salary = base_salary;

        if (Object.keys(employeeUpdates).length > 0) {
            await employeeRepository.update(id, employeeUpdates);
        }

        if (name && employee.user_id) {
            await userRepository.update(employee.user_id, { name });
        }

        return await employeeRepository.getEmployeeWithRelations(id);
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(error.message || 'Unable to update employee', StatusCodes.INTERNAL_SERVER_ERROR);
    }
};

const deleteEmployee = async (id) => {
    try {
        const employee = await employeeRepository.get(id);
        if (!employee) {
            throw new AppError('Employee not found to delete', StatusCodes.NOT_FOUND);
        }

        // Deleting the associated user will CASCADE delete the employee profile
        await userRepository.destroy(employee.user_id);
        return { message: 'Employee deleted successfully' };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(error.message || 'Cannot delete employee', StatusCodes.INTERNAL_SERVER_ERROR);
    }
};

module.exports = {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
};
