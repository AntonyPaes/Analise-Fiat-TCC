const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SymptomCatalog = sequelize.define('SymptomCatalog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  codigo_obd: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  keywords: {
    type: DataTypes.TEXT, // armazenado como JSON stringificado
    allowNull: true,
    get() {
      const raw = this.getDataValue('keywords');
      try {
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    },
    set(val) {
      this.setDataValue('keywords', JSON.stringify(val || []));
    },
  },
}, {
  tableName: 'symptom_catalogs',
  timestamps: true,
});

module.exports = SymptomCatalog;
