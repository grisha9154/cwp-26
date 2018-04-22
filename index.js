const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const config = require('./config.json');
const sequelize = require('sequelize');
const YAML = require('yamljs');

const TeamsService = require('./services/teams');
const UsersService = require('./services/users');
const WorkPeriodsService = require('./services/workPeriods');

const models = require('./models')(sequelize, config);

const teamsService = new TeamsService({...models});
const usersService = new UsersService(models.users);
const workPeriodsService = new WorkPeriodsService(models.workPeriods);

const apiController = require('./controllers/api')({
    teamsService,
    usersService,
    workPeriodsService
});

const app = express(http);

app.use(morgan('dev'));

app.use(bodyParser.json({ type: 'application/json' }));

app.use((req, res, next) => {
    if (req.headers['content-type'] === 'application/yaml') {
        req.setEncoding('utf8');
        let body = '';

        req.on('data', (data) => {
           body += data;
        });

        req.on('end', () => {
           req.body = YAML.parse(body);
           next();
        });
    } else {
        next();
    }
});

app.use('/api/v1/', apiController);

app.use((err, req, res, next) => {
   res.send(err);
});
// models.sequelize.sync({force: true});

app.listen(3000);