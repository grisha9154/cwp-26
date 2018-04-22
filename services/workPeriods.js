const CrudService = require('./crud');

class WorkPeriodsService extends CrudService {
    constructor(repository) {
        super(repository)
    }

    async readAll({limit, page, teamId, userId}) {
        limit = (limit < 0 || limit > 20) ? 10 : limit;
        page = (page < 1) ? 1 : page;

        return await this.repository.findAll({
            limit,
            offset: limit * (page - 1),
            where: {
              teamId,
              userId
            },
            raw: true
        })
    }

    async read({ teamId, userId, workPeriodId }) {
        return await this.repository.findById(workPeriodId, {
            where: {
              teamId,
              userId
            },
            raw: true
        });
    }

    async create(item) {
        return await this.repository.create(item);
    }

    async delete({ teamId, userId, workPeriodId }) {
        return await this.repository.destroy({
            where: {
                teamId,
                userId,
                id: workPeriodId
            }
        })
    }

    async update({ teamId, userId, workPeriodId, workPeriod }) {
        return await this.repository.update(workPeriod, {
            where: {
                teamId,
                userId,
                id: workPeriodId
            }
        })
    }
}

module.exports = WorkPeriodsService;