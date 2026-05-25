const { Sequelize } = require('sequelize');
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

let sequelize;

if (env === 'test') {
  sequelize = new Sequelize('sqlite::memory:', { logging: false });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'fiat_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || '1234',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
    }
  );
}

module.exports = sequelize;
