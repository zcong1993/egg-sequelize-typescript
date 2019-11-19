'use strict';

exports.sequelizeTypescript = {
  dialect: 'mysql',
  database: '',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  models: [__dirname + '/../app/model'],
};
