const Vehicle = require('../models/Vehicle');

describe('Vehicle Model (Unit Tests)', () => {
  it('deve ter o nome da tabela configurado como "vehicles"', () => {
    expect(Vehicle.tableName).toBe('vehicles');
  });

  it('deve possuir os campos obrigatórios no modelo', () => {
    const attributes = Vehicle.getAttributes();
    
    expect(attributes).toHaveProperty('modelo');
    expect(attributes).toHaveProperty('ano');
    expect(attributes).toHaveProperty('motorizacao');
    expect(attributes).toHaveProperty('quilometragem');
    expect(attributes).toHaveProperty('tipo_cambio');
  });
});
