module.exports = (Sequelize, config) => {
    const options = {
        host: config.db.host,
        dialect: 'mysql',
        logging: false,
        define: {
            defaultScope: {
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                }
            }
        }
    };
    const sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, options);

    const User = require('./user')(Sequelize, sequelize);
    const Team = require('./team')(Sequelize, sequelize);
    const WorkPeriod = require('./workPeriod')(Sequelize, sequelize);

    User.belongsToMany(Team, {as: 'Teams', through: 'UsersTeams'});
    Team.belongsToMany(User, {as: 'Users', through: 'UsersTeams'});
    WorkPeriod.belongsTo(User, {foreignKey: 'userId', targetKey: 'id', as: 'User'});
    WorkPeriod.belongsTo(Team, {foreignKey: 'teamId', targetKey: 'id', as: 'Team'});

    return {
        users: User,
        teams: Team,
        workPeriods: WorkPeriod,

        Sequelize,
        sequelize,
    };
};
