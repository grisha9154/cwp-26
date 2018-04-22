const CrudService = require('./crud');
const datesHelper = require('../helpers/dates');

class TeamsService extends CrudService {
    constructor({ teams, users, workPeriods }) {
        super(teams);
        this.users = users;
        this.workPeriods = workPeriods;
    }

    async readAll({limit, page}) {

        const teams = await this.repository.findAll({
            ...super.readConfig({limit, page}),
            include: ['Users']
        });

        // teams.forEach((team) => {
        //     team.Users.forEach(async (user) => {
        //         const workPeriod = await this.workPeriods.findOne({
        //             where: {
        //                 teamId: team.id,
        //                 userId: user.id
        //             }
        //         });
        //
        //         user.dataValues.status = (workPeriod && datesHelper.isWorkPeriodActive(workPeriod, user.timezone))
        //             ? 'active' : 'inactive';
        //     });
        // });

        for (let i = 0; i < teams.length; i++) {
            for (let k = 0; k < teams[i].Users.length; k++) {
                const workPeriod = await this.workPeriods.findOne({
                    where: {
                        teamId: teams[i].id,
                        userId: teams[i].Users[k].id
                    }
                });

                teams[i].Users[k].dataValues.status = (workPeriod && datesHelper.isWorkPeriodActive(workPeriod, teams[i].Users[k].timezone))
                            ? 'active' : 'inactive';
            }
        }

        return teams;
    }

    async read(id) {
        return await this.repository.findById(id, { include: ['Users'] });
    }

    async addUser(teamId, userId) {
        const user = await this.users.findById(userId);

        if (user && user.validated) {
            const team = await this.repository.findById(teamId);

            if (team) {
                team.addUser(user);
            } else {
                throw new Error('Invalid team id');
            }
        } else {
            throw new Error('User is not found/validated');
        }

    }

    async removeUser(teamId, userId) {
        const user = await this.users.findById(userId);
        const team = await this.repository.findById(teamId);

        if (user && team) {
            team.removeUser(user);
        } else {
            throw new Error('User/team is not found');
        }
    }

    async getCommonWorkHours(teamId, userId1, userId2) {
        if (Number.isInteger(teamId) && Number.isInteger(userId1) && Number.isInteger(userId2)) {
            const user1 = await this.users.findById(userId1);
            const user2 = await this.users.findById(userId2);

            const workPeriod1 = await this.workPeriods.findOne({
                where: {
                    teamId,
                    userId: userId1
                },
                raw: true
            });

            const workPeriod2 = await this.workPeriods.findOne({
                where: {
                    teamId,
                    userId: userId2
                },
                raw: true
            });

            user1.workPeriod = workPeriod1;
            user2.workPeriod = workPeriod2;

            return datesHelper.getCommonWorkHours(user1, user2);
        } else {
            throw new Error('getCommonWorkHours error');
        }
    }
}

module.exports = TeamsService;