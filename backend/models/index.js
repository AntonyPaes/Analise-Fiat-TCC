const sequelize = require('../config/database');
const Vehicle = require('./Vehicle');
const VehicleCatalog = require('./VehicleCatalog');
const Symptom = require('./Symptom');
const Cause = require('./Cause');
const RepairGuide = require('./RepairGuide');
const SymptomCatalog = require('./SymptomCatalog');
const CauseCatalog = require('./CauseCatalog');
const RepairGuideCatalog = require('./RepairGuideCatalog');

// Associações: diagnóstico vinculado a veículo específico
Vehicle.hasMany(Symptom, { foreignKey: 'vehicleId', as: 'symptoms', onDelete: 'CASCADE' });
Symptom.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

Symptom.hasMany(Cause, { foreignKey: 'symptomId', as: 'causes', onDelete: 'CASCADE' });
Cause.belongsTo(Symptom, { foreignKey: 'symptomId', as: 'symptom' });

Cause.hasMany(RepairGuide, { foreignKey: 'causeId', as: 'repairGuides', onDelete: 'CASCADE' });
RepairGuide.belongsTo(Cause, { foreignKey: 'causeId', as: 'cause' });

// Associações: catálogo de referência (independente de veículo)
SymptomCatalog.hasMany(CauseCatalog, { foreignKey: 'symptomCatalogId', as: 'causes', onDelete: 'CASCADE' });
CauseCatalog.belongsTo(SymptomCatalog, { foreignKey: 'symptomCatalogId', as: 'symptom' });

CauseCatalog.hasMany(RepairGuideCatalog, { foreignKey: 'causeCatalogId', as: 'repairGuides', onDelete: 'CASCADE' });
RepairGuideCatalog.belongsTo(CauseCatalog, { foreignKey: 'causeCatalogId', as: 'cause' });

module.exports = {
  sequelize,
  Vehicle,
  VehicleCatalog,
  Symptom,
  Cause,
  RepairGuide,
  SymptomCatalog,
  CauseCatalog,
  RepairGuideCatalog,
};
