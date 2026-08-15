const sequelize = require('../config/database');
const Vehicle = require('./Vehicle');
const VehicleCatalog = require('./VehicleCatalog');
const Symptom = require('./Symptom');
const Cause = require('./Cause');
const RepairGuide = require('./RepairGuide');

Vehicle.hasMany(Symptom, { foreignKey: 'vehicleId', as: 'symptoms', onDelete: 'CASCADE' });
Symptom.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

Symptom.hasMany(Cause, { foreignKey: 'symptomId', as: 'causes', onDelete: 'CASCADE' });
Cause.belongsTo(Symptom, { foreignKey: 'symptomId', as: 'symptom' });

Cause.hasMany(RepairGuide, { foreignKey: 'causeId', as: 'repairGuides', onDelete: 'CASCADE' });
RepairGuide.belongsTo(Cause, { foreignKey: 'causeId', as: 'cause' });

module.exports = {
  sequelize,
  Vehicle,
  VehicleCatalog,
  Symptom,
  Cause,
  RepairGuide
};
