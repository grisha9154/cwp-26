const CRUDController = require('./crud');

class UsersController extends CRUDController {
    constructor(service) {
        super(service);
    }

    getRouter() {
        super.getRouter();

        this.router.get('/:id/validate', async (req, res, next) => {
            try {
                const validationToken = req.query.validationToken;

                await this.service.validate(req.id, validationToken);
            } catch (error) {
                next(error);
            }
        });

        return this.router;
    }
}

module.exports = UsersController;