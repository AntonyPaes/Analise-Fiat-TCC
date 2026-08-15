const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VehicleCatalog = sequelize.define('VehicleCatalog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  modelo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ano: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  motorizacao: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo_cambio: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'vehicle_catalogs',
  timestamps: true,
});

module.exports = VehicleCatalog;
