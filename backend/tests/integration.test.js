const request = require('supertest');
const app = require('../app');
const sequelize = require('../config/database');
const { Vehicle, VehicleCatalog, Symptom, Cause, RepairGuide } = require('../models');

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Vehicle API Integrations', () => {
  it('deve retornar as opções cadastradas no catálogo', async () => {
    await VehicleCatalog.create({
      modelo: 'Argo',
      ano: 2022,
      motorizacao: '1.0 Firefly',
      tipo_cambio: 'Manual'
    });

    const response = await request(app).get('/api/vehicles/options');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].modelo).toBe('Argo');
  });
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

describe('Database Integration Flow (Vehicle -> Symptom -> Cause -> RepairGuide)', () => {
  it('deve criar e recuperar a árvore completa de diagnóstico com sucesso', async () => {
    const vehicle = await Vehicle.create({
      modelo: 'Uno',
      ano: 2015,
      motorizacao: '1.0 Firefly',
      quilometragem: 85000,
      tipo_cambio: 'Manual'
    });
    expect(vehicle.id).toBeDefined();

    const symptom = await Symptom.create({
      nome: 'Dificuldade na partida a frio',
      descricao: 'O motor demora a pegar pela manhã em dias frios.',
      codigo_obd: 'P0300',
      vehicleId: vehicle.id
    });
    expect(symptom.id).toBeDefined();
    expect(symptom.vehicleId).toBe(vehicle.id);

    const cause = await Cause.create({
      nome: 'Bateria com baixa carga',
      descricao: 'Bateria não está fornecendo CCA suficiente para a partida.',
      probabilidade: 'Alta',
      symptomId: symptom.id
    });
    expect(cause.id).toBeDefined();
    expect(cause.symptomId).toBe(symptom.id);

    const guide = await RepairGuide.create({
      titulo: 'Substituição ou recarga da bateria',
      descricao: 'Como testar e trocar a bateria do veículo.',
      passos: '1. Desconecte o polo negativo.\n2. Desconecte o polo positivo.\n3. Retire a bateria antiga.\n4. Limpe os terminais.\n5. Instale a nova bateria.',
      tempo_estimado: '20 minutos',
      dificuldade: 'Fácil',
      ferramentas: 'Chave de boca 10mm, Multímetro',
      causeId: cause.id
    });
    expect(guide.id).toBeDefined();
    expect(guide.causeId).toBe(cause.id);

    const retrievedVehicle = await Vehicle.findByPk(vehicle.id, {
      include: [
        {
          model: Symptom,
          as: 'symptoms',
          include: [
            {
              model: Cause,
              as: 'causes',
              include: [
                {
                  model: RepairGuide,
                  as: 'repairGuides'
                }
              ]
            }
          ]
        }
      ]
    });

    expect(retrievedVehicle).toBeDefined();
    expect(retrievedVehicle.symptoms.length).toBe(1);
    expect(retrievedVehicle.symptoms[0].nome).toBe('Dificuldade na partida a frio');
    
    expect(retrievedVehicle.symptoms[0].causes.length).toBe(1);
    expect(retrievedVehicle.symptoms[0].causes[0].nome).toBe('Bateria com baixa carga');

    expect(retrievedVehicle.symptoms[0].causes[0].repairGuides.length).toBe(1);
    expect(retrievedVehicle.symptoms[0].causes[0].repairGuides[0].titulo).toBe('Substituição ou recarga da bateria');
  });
});
