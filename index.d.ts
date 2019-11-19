import { Sequelize, SequelizeOptions } from 'sequelize-typescript'

interface Config extends SequelizeOptions {
  connectionUri?: string;
  Sequelize?: Sequelize;
}

declare module 'egg' {
  interface Application {
    sequelize: Sequelize;
  }

  interface EggAppConfig {
    sequelize: Config;
  }
}
