const { Vehicle, VehicleCatalog, Symptom, Cause, RepairGuide } = require('../models');

describe('Database Models Unit Tests', () => {
  describe('Vehicle Model', () => {
    it('deve ter o nome da tabela configurado como "vehicles"', () => {
      expect(Vehicle.tableName).toBe('vehicles');
    });

    it('deve possuir os campos corretos no modelo', () => {
      const attributes = Vehicle.getAttributes();
      expect(attributes).toHaveProperty('modelo');
      expect(attributes).toHaveProperty('ano');
      expect(attributes).toHaveProperty('motorizacao');
      expect(attributes).toHaveProperty('quilometragem');
      expect(attributes).toHaveProperty('tipo_cambio');
    });
  });

  describe('VehicleCatalog Model', () => {
    it('deve ter o nome da tabela configurado como "vehicle_catalogs"', () => {
      expect(VehicleCatalog.tableName).toBe('vehicle_catalogs');
    });

    it('deve possuir os campos corretos no modelo', () => {
      const attributes = VehicleCatalog.getAttributes();
      expect(attributes).toHaveProperty('modelo');
      expect(attributes).toHaveProperty('ano');
      expect(attributes).toHaveProperty('motorizacao');
      expect(attributes).toHaveProperty('tipo_cambio');
    });
  });

  describe('Symptom Model', () => {
    it('deve ter o nome da tabela configurado como "symptoms"', () => {
      expect(Symptom.tableName).toBe('symptoms');
    });

    it('deve possuir os campos corretos no modelo', () => {
      const attributes = Symptom.getAttributes();
      expect(attributes).toHaveProperty('nome');
      expect(attributes).toHaveProperty('descricao');
      expect(attributes).toHaveProperty('codigo_obd');
      expect(attributes).toHaveProperty('status');
    });
  });

  describe('Cause Model', () => {
    it('deve ter o nome da tabela configurado como "causes"', () => {
      expect(Cause.tableName).toBe('causes');
    });

    it('deve possuir os campos corretos no modelo', () => {
      const attributes = Cause.getAttributes();
      expect(attributes).toHaveProperty('nome');
      expect(attributes).toHaveProperty('descricao');
      expect(attributes).toHaveProperty('probabilidade');
    });
  });

  describe('RepairGuide Model', () => {
    it('deve ter o nome da tabela configurado como "repair_guides"', () => {
      expect(RepairGuide.tableName).toBe('repair_guides');
    });

    it('deve possuir os campos corretos no modelo', () => {
      const attributes = RepairGuide.getAttributes();
      expect(attributes).toHaveProperty('titulo');
      expect(attributes).toHaveProperty('descricao');
      expect(attributes).toHaveProperty('passos');
      expect(attributes).toHaveProperty('tempo_estimado');
      expect(attributes).toHaveProperty('dificuldade');
      expect(attributes).toHaveProperty('ferramentas');
    });
  });

  describe('Model Relationships', () => {
    it('deve possuir associação de Vehicle para Symptom (1:N)', () => {
      expect(Vehicle.associations).toHaveProperty('symptoms');
      expect(Vehicle.associations.symptoms.associationAccessor).toBe('symptoms');
      expect(Symptom.associations).toHaveProperty('vehicle');
    });

    it('deve possuir associação de Symptom para Cause (1:N)', () => {
      expect(Symptom.associations).toHaveProperty('causes');
      expect(Symptom.associations.causes.associationAccessor).toBe('causes');
      expect(Cause.associations).toHaveProperty('symptom');
    });

    it('deve possuir associação de Cause para RepairGuide (1:N)', () => {
      expect(Cause.associations).toHaveProperty('repairGuides');
      expect(Cause.associations.repairGuides.associationAccessor).toBe('repairGuides');
      expect(RepairGuide.associations).toHaveProperty('cause');
    });
  });
});
