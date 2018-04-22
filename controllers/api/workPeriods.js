const CRUDController = require('./crud');
const YAML = require('yamljs');

function sendData({res, items, contentType, next}) {
    if (contentType === 'application/yaml') {
        res.setHeader('content-type', 'application/yaml');
        res.send(YAML.stringify(items));
    } else {
        res.setHeader('content-type', 'application/json');
        res.send(JSON.stringify(items));
    }
}

class WorkPeriodsController extends CRUDController {
    constructor(service) {
        super(service);
    }

    getRouter() {
        this.router.route('/')
        .get(async (req, res, next) => {
            const limit = Number.parseInt(req.query.limit) || 10;
            const page = Number.parseInt(req.query.page) || 1;
            const contentType = req.get('accept');

            const items = await this.service.readAll({
                limit,
                page,
                teamId: req.id,
                userId: req.userId
            });

            if (items) {
                sendData({ res, contentType, items, next })
            } else {
                next('error workperiods get');
            }
        })
        .post((req, res, next) => {
            req.body.teamId = req.id;
            req.body.userId = req.userId;
            // TODO: тут должна была быть валидация
            const item = this.service.create(req.body);

            if (item) {
                res.sendStatus(200);
            } else {
                next('crud create error');
            }
        });

        this.router.param('workPeriodId', (req, res, next) => {
            const workPeriodId = Number.parseInt(req.params.workPeriodId);

            if (Number.isInteger(workPeriodId)) {
                req.workPeriodId = workPeriodId;

                next();
            } else {
                next('workperiod id param error')
            }
        });

        this.router.route('/:workPeriodId')
        .get(async (req, res, next) => {
            const items = await this.service.read({
                teamId: req.id,
                userId: req.userId,
                workPeriodId: req.workPeriodId
            });

            if (items) {
                const contentType = req.get('accept') || 'application/json';

                sendData({ res, items, contentType });
            } else {
                next('workperiod id get error');
            }
        })
        .put(async (req, res, next) => {
            // TODO: тут должна была быть валидация
            const rowCount = await this.service.update({
                teamId: req.id,
                userId: req.userId,
                workPeriodId: req.workPeriodId,
                workPeriod: req.body
            });

            // TODO: ?
            if (rowCount[0]) {
                res.sendStatus(200);
            } else {
                next('workperiod put error');
            }
        })
        .delete(async (req, res, next) => {
            const rowCount = await this.service.delete({
                teamId: req.id,
                userId: req.userId,
                workPeriodId: req.workPeriodId
            });

            if (rowCount) {
                res.sendStatus(200);
            } else {
                next('workperiod delete error');
            }

        });

        return this.router;
    }
}

module.exports = WorkPeriodsController;