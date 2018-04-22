const express = require('express');
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

class CRUDController {
    constructor(service) {
        this.service = service;
        this.router = express.Router();
    }

    getRouter() {
        this.router.route('/')
        .get(async (req, res, next) => {
            const limit = Number.parseInt(req.query.limit) || 10;
            const page = Number.parseInt(req.query.page) || 1;
            const contentType = req.get('accept');

            const items = await this.service.readAll({limit, page});

            if (items) {
                sendData({ res, contentType, items, next })
            } else {
                next('error crud get');
            }
        })
        .post((req, res, next) => {
            // TODO: тут должна была быть валидация
            const item = this.service.create(req.body);

            if (item) {
                res.sendStatus(200);
            } else {
                next('crud create error');
            }
        });

        this.router.param('id', (req, res, next) => {
            const id = Number.parseInt(req.params.id);

            if (Number.isInteger(id)) {
                req.id = id;

                next();
            } else {
                next('crud id param error')
            }
        });

        this.router.route('/:id')
        .get(async (req, res, next) => {
            const items = await this.service.read(req.id);

            if (items) {
                const contentType = req.get('accept') || 'application/json';

                sendData({ res, items, contentType });
            } else {
                next('crud id get error');
            }
        })
        .put(async (req, res, next) => {
            // TODO: тут должна была быть валидация

            const rowCount = await this.service.update(req.id, req.body);

            // TODO: ?
            if (rowCount[0]) {
                res.sendStatus(200);
            } else {
                next('crud put error');
            }
        })
        .delete(async (req, res, next) => {
            const rowCount = await this.service.delete(req.id);

            if (rowCount) {
                res.sendStatus(200);
            } else {
                next('crud delete error');
            }

        });

        return this.router;
    }
}

module.exports = CRUDController;