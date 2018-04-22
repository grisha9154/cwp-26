const CrudService = require('./crud');

class UsersService extends CrudService {
    constructor(repository) {
        super(repository)
    }

    async validate(id, validationToken) {
        const user = await super.read(id);

        if (user && user.validationToken === validationToken) {
            user.validated = true;

            super.update(id, user);
        } else {
            throw new Error('validation error');
        }
    }
}

module.exports = UsersService;