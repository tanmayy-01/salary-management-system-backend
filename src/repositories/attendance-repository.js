const CrudRepository = require('./crud-repository');
const { Attendance, Employee, User } = require('../models');
const { Op } = require('sequelize');

class AttendanceRepository extends CrudRepository {
    constructor() {
        super(Attendance);
    }

    async getAttendanceByEmployeeAndDate(employeeId, date) {
        return await this.findOne({
            where: {
                employee_id: employeeId,
                date: date
            }
        });
    }

    async getAttendancesByEmployeeAndRange(employeeId, startDate, endDate) {
        return await this.getAll({
            where: {
                employee_id: employeeId,
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            order: [['date', 'ASC']]
        });
    }

    async getAllAttendancesInRange(startDate, endDate) {
        return await this.getAll({
            where: {
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
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
        });
    }

    async upsertAttendance(data) {
        const existing = await this.getAttendanceByEmployeeAndDate(data.employee_id, data.date);
        if (existing) {
            return await this.update(existing.id, {
                working_hours: data.working_hours,
                overtime_hours: data.overtime_hours || 0.00
            });
        }
        return await this.create(data);
    }

    async countAttendedDays(employeeId, startDate, endDate) {
        return await this.count({
            where: {
                employee_id: employeeId,
                date: {
                    [Op.between]: [startDate, endDate]
                },
                working_hours: {
                    [Op.gt]: 0
                }
            }
        });
    }
}

module.exports = AttendanceRepository;
