const express = require('express');

module.exports = ({usersService, teamsService, workPeriodsService}) => {
    const router = express.Router();

    const UsersController = require('./users');
    const TeamsController = require('./teams');
    const WorkPeriodsController = require('./workPeriods');

    const usersController = new UsersController(usersService).getRouter();
    const teamsController = new TeamsController(teamsService).getRouter();
    const workPeriodsController = new WorkPeriodsController(workPeriodsService).getRouter();

    router.use('/users', usersController);
    router.use('/teams', teamsController);

    teamsController.param('userId', (req, res, next) => {
        const userId = Number.parseInt(req.params.userId);

        if (Number.isInteger(userId)) {
            req.userId = userId;

            next();
        } else {
            next('index id param error')
        }
    });
    teamsController.use('/:id/users/:userId/workPeriods', workPeriodsController);

    teamsController.get('/:id/users/getCommonWorkHours', async (req, res) => {
        const commonHours = await teamsService.getCommonWorkHours(
            Number.parseInt(req.params.id),
            Number.parseInt(req.query.userId1),
            Number.parseInt(req.query.userId2)
        );

        res.send(commonHours);
    });

    return router;
};
