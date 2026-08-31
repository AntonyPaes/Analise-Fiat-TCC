const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RepairGuideCatalog = sequelize.define('RepairGuideCatalog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  passos: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  tempo_estimado: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dificuldade: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ferramentas: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'repair_guide_catalogs',
  timestamps: true,
});

module.exports = RepairGuideCatalog;
