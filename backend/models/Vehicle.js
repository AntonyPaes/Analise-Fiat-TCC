const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vehicle = sequelize.define('Vehicle', {
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
  quilometragem: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tipo_cambio: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'vehicles',
  timestamps: true,
});

module.exports = Vehicle;
