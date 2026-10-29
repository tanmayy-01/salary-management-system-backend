const CrudRepository = require('./crud-repository');
const { Leave, Employee, User } = require('../models');
const { Op } = require('sequelize');

class LeaveRepository extends CrudRepository {
    constructor() {
        super(Leave);
    }

    async getLeaveByEmployeeAndDate(employeeId, date) {
        return await this.findOne({
            where: {
                employee_id: employeeId,
                date: date
            }
        });
    }

    async getLeavesByEmployee(employeeId, { startDate, endDate, status } = {}) {
        const whereClause = { employee_id: employeeId };

        if (status) {
            whereClause.status = status;
        }

        if (startDate && endDate) {
            whereClause.date = { [Op.between]: [startDate, endDate] };
        }

        return await this.getAll({
            where: whereClause,
            order: [['date', 'DESC']]
        });
    }

    async getAllLeaves({ status, startDate, endDate, limit, offset } = {}) {
        const whereClause = {};

        if (status) {
            whereClause.status = status;
        }

        if (startDate && endDate) {
            whereClause.date = { [Op.between]: [startDate, endDate] };
        }

        const options = {
            where: whereClause,
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'name', 'email']
                        }
                    ]
                }
            ],
            order: [['date', 'DESC']]
        };

        if (limit) options.limit = parseInt(limit, 10);
        if (offset !== undefined) options.offset = parseInt(offset, 10);

        return await this.findAndCountAll(options);
    }

    async countLeavesByStatus(employeeId, status, startDate, endDate) {
        const whereClause = {};
        if (employeeId) {
            whereClause.employee_id = employeeId;
        }
        if (status) {
            whereClause.status = status;
        }
        if (startDate && endDate) {
            whereClause.date = { [Op.between]: [startDate, endDate] };
        }

        return await this.count({ where: whereClause });
    }
}

module.exports = LeaveRepository;
