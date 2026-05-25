const request = require('supertest');
const app = require('../app');
const sequelize = require('../config/database');

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Vehicle API Integrations', () => {
  it('deve criar um novo veículo (Happy Path)', async () => {
    const response = await request(app)
      .post('/api/vehicles')
      .send({
        modelo: 'Pulse',
        ano: 2024,
        motorizacao: '1.3 Turbo 270',
        quilometragem: 5000,
        tipo_cambio: 'Automático CVT'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.modelo).toBe('Pulse');
  });

  it('não deve permitir a criação de um veículo com dados faltando', async () => {
    const response = await request(app)
      .post('/api/vehicles')
      .send({
        modelo: 'Argo'
      });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Todos os campos do veículo são obrigatórios.');
  });
});
