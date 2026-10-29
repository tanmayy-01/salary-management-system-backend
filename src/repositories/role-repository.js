const CrudRepository = require('./crud-repository');
const { Role } = require('../models');

class RoleRepository extends CrudRepository {
    constructor() {
        super(Role);
    }

    async getRoleByName(roleName) {
        return await this.findOne({
            where: { role_name: roleName }
        });
    }
}

module.exports = RoleRepository;
