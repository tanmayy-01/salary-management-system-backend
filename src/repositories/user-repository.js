const CrudRepository = require('./crud-repository');
const { User, Role, Employee } = require('../models');

class UserRepository extends CrudRepository {
    constructor() {
        super(User);
    }

    async getUserByEmail(email) {
        return await this.model.findOne({
            where: { email },
            include: [
                {
                    model: Role,
                    as: 'role',
                    attributes: ['id', 'role_name']
                },
                {
                    model: Employee,
                    as: 'employeeProfile',
                    attributes: ['id', 'mobile', 'address', 'base_salary']
                }
            ]
        });
    }

    async getUserWithRole(id) {
        return await this.get(id, {
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Role,
                    as: 'role',
                    attributes: ['id', 'role_name']
                },
                {
                    model: Employee,
                    as: 'employeeProfile',
                    attributes: ['id', 'mobile', 'address', 'base_salary']
                }
            ]
        });
    }
}

module.exports = UserRepository;
