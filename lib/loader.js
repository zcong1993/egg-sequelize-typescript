'use strict';

const { Sequelize } = require('sequelize-typescript');

const AUTH_RETRIES = Symbol('authenticateRetries');

const sleep = n => new Promise(resolve => resosetTimeout(resolve, n));

module.exports = app => {
  const defaultConfig = {
    logging(...args) {
      // if benchmark enabled, log used
      const used = typeof args[1] === 'number' ? `(${args[1]}ms)` : '';
      app.logger.info('[egg-sequelize]%s %s', used, args[0]);
    },
    host: 'localhost',
    port: 3306,
    username: 'root',
    benchmark: true,
    define: {
      freezeTableName: false,
      underscored: true,
    },
  };

  const config = app.config.sequelizeTypescript;
  // support customize sequelize
  app.Sequelize = config.Sequelize || Sequelize;

  const mergedConfig = Object.assign({}, defaultConfig, config);

  const sequelize = config.connectionUri ?
    new app.Sequelize(config.connectionUri, mergedConfig) :
    new app.Sequelize(mergedConfig);

  app.sequelize = sequelize;

  app.beforeStart(async () => {
    await authenticate(sequelize);
  });

  /**
   * Authenticate to test Database connection.
   *
   * This method will retry 3 times when database connect fail in temporary, to avoid Egg start failed.
   * @param {Application} database instance of sequelize
   */
  async function authenticate(database) {
    database[AUTH_RETRIES] = database[AUTH_RETRIES] || 0;

    try {
      await database.authenticate();
    } catch (e) {
      if (e.name !== 'SequelizeConnectionRefusedError') throw e;
      if (app.model[AUTH_RETRIES] >= 3) throw e;

      // sleep 2s to retry, max 3 times
      database[AUTH_RETRIES] += 1;
      app.logger.warn(`Sequelize Error: ${e.message}, sleep 2 seconds to retry...`);
      await sleep(2000);
      await authenticate(database);
    }
  }
};
