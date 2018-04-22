const CRUDController = require('./crud');

class TeamsController extends CRUDController {
    constructor(teamsService) {
        super(teamsService);
    }

    getRouter() {
        super.getRouter();

        this.router.post('/:id/users/addUser', (req, res, next) => {
            try {
                this.service.addUser(req.id, req.query.userId);

                res.sendStatus(200);
            } catch (error) {
                next(error);
            }
        });

        this.router.post('/:id/users/removeUser', (req, res, next) => {
            try {
                this.service.removeUser(req.id, req.query.userId);

                res.sendStatus(200);
            } catch (error) {
                next(error);
            }

        });

        return this.router;
    }
}

module.exports = TeamsController;