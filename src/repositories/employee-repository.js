const CrudRepository = require('./crud-repository');
const { Employee, User, Attendance, Leave } = require('../models');
const { Op } = require('sequelize');

class EmployeeRepository extends CrudRepository {
    constructor() {
        super(Employee);
    }

    async getEmployeeByUserId(userId) {
        return await this.findOne({
            where: { user_id: userId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'role_id']
                }
            ]
        });
    }

    async getAllEmployeesWithDetails({ search, limit, offset } = {}) {
        const userWhere = {};
        if (search) {
            userWhere[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        const options = {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'role_id'],
                    where: Object.keys(userWhere).length > 0 ? userWhere : undefined
                }
            ],
            order: [['id', 'ASC']]
        };

        if (limit) options.limit = parseInt(limit, 10);
        if (offset !== undefined) options.offset = parseInt(offset, 10);

        return await this.findAndCountAll(options);
    }

    async getEmployeeWithRelations(id) {
        return await this.get(id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'role_id']
                },
                {
                    model: Attendance,
                    as: 'attendances',
                    limit: 10,
                    order: [['date', 'DESC']]
                },
                {
                    model: Leave,
                    as: 'leaves',
                    limit: 10,
                    order: [['date', 'DESC']]
                }
            ]
        });
    }

    async countEmployees() {
        return await this.count();
    }
}

module.exports = EmployeeRepository;
