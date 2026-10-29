const CrudRepository = require('./crud-repository');
const { Salary, Employee, User } = require('../models');

class SalaryRepository extends CrudRepository {
    constructor() {
        super(Salary);
    }

    async getSalaryByEmployeeAndMonthYear(employeeId, month, year) {
        return await this.findOne({
            where: {
                employee_id: employeeId,
                month: parseInt(month, 10),
                year: parseInt(year, 10)
            }
        });
    }

    async getAllSalaries({ month, year, limit, offset } = {}) {
        const whereClause = {};
        if (month) whereClause.month = parseInt(month, 10);
        if (year) whereClause.year = parseInt(year, 10);

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
            order: [['year', 'DESC'], ['month', 'DESC'], ['id', 'DESC']]
        };

        if (limit) options.limit = parseInt(limit, 10);
        if (offset !== undefined) options.offset = parseInt(offset, 10);

        return await this.findAndCountAll(options);
    }

    async getSalariesByEmployee(employeeId, { year } = {}) {
        const whereClause = { employee_id: employeeId };
        if (year) whereClause.year = parseInt(year, 10);

        return await this.getAll({
            where: whereClause,
            order: [['year', 'DESC'], ['month', 'DESC']]
        });
    }
}

module.exports = SalaryRepository;
