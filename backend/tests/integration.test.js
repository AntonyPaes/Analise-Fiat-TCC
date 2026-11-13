const request = require('supertest');
const app = require('../app');
const sequelize = require('../config/database');
const { Vehicle, VehicleCatalog, Symptom, Cause, RepairGuide } = require('../models');
const seedDatabase = require('../config/seed');

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await sequelize.sync({ force: true });
  await seedDatabase();
}, 30000);

afterAll(async () => {
  await sequelize.close();
});

describe('Coxins em todos os veículos', () => {
  it('inclui Toro 2026 2.2 diesel e mantém 2.0, sem duplicar ao reinicializar', async () => {
    const where = { modelo: 'Toro', ano: 2026, motorizacao: '2.2 Turbodiesel', tipo_cambio: 'Automático 9 Marchas' };
    expect(await VehicleCatalog.count({ where })).toBe(1);
    expect(await VehicleCatalog.count({ where: { modelo: 'Toro', ano: 2025, motorizacao: '2.2 Turbodiesel' } })).toBe(0);
    expect(await VehicleCatalog.count({ where: { modelo: 'Toro', ano: 2026, motorizacao: '2.0 Turbodiesel' } })).toBeGreaterThan(0);
    await VehicleCatalog.destroy({ where });
    const before = await VehicleCatalog.count();
    await seedDatabase();
    await seedDatabase();
    expect(await VehicleCatalog.count({ where })).toBe(1);
    expect(await VehicleCatalog.count()).toBe(before + 1);
  });

  it.each([
    ['suspensão dianteira batendo', 'Suspensão', 'Amortecedor dianteiro'],
    ['farol baixo queimado', 'Elétrica', 'Lâmpada do farol'],
    ['fluido de freio abaixo do nível', 'Freios', 'Fluido de freio DOT4'],
    ['alavanca não trava e não faz barulho', 'Freios', 'Alavanca do freio de mão'],
    ['palheta arranhando o vidro', 'Elétrica', 'Palheta do limpador de para-brisa'],
    ['motor do limpador não funciona', 'Elétrica', 'Motor do limpador de para-brisa'],
    ['pisca de seta não funciona', 'Elétrica', 'Lâmpada da seta'],
    ['vela aquecedora queimada no frio', 'Motor', 'Vela aquecedora diesel']
  ])('API persiste guias e devolve peças específicas para %s', async (description, selectedCategory, part) => {
    const vehicle = await Vehicle.create({ modelo: 'Ducato', ano: 2020, motorizacao: '2.3 Turbodiesel', tipo_cambio: 'Manual', quilometragem: 90000 });
    const response = await request(app).post(`/api/vehicles/${vehicle.id}/diagnose`).send({ description, selectedCategory });
    expect(response.status).toBe(200);
    const result = response.body.find(r => r.match.purchaseParts?.includes(part));
    expect(result).toBeDefined();
    expect(result.match.purchaseRecommended).toBe(true);
    expect(result.causes[0].repairGuides.length).toBeGreaterThan(0);
    expect(response.body.length).toBeLessThanOrEqual(5);
    if (selectedCategory === 'Suspensão') expect(response.body).toHaveLength(5);
    if (/farol|seta/.test(description)) expect(result.match.lightingNotice).toContain('LED integrado');
    const saved = await RepairGuide.findByPk(result.causes[0].repairGuides[0].id);
    expect(saved.passos).toBe(result.causes[0].repairGuides[0].passos);
  });

  it('prioriza os apoios em todas as combinações do catálogo de veículos', async () => {
    const { rankDiagnosis } = require('../services/diagnosisService');
    const catalog = require('../config/tcc_symptoms.json');
    const vehicles = await VehicleCatalog.findAll();
    expect(vehicles.length).toBeGreaterThan(0);
    for (const vehicleRecord of vehicles) {
      const vehicle = vehicleRecord.toJSON();
      const engine = rankDiagnosis({ catalog, query: 'motor chacoalhando quando paro no sinal em ponto morto', selectedCategory: 'Motor', vehicle });
      const transmission = rankDiagnosis({ catalog, query: 'pancadas e coices ao engatar marcha', selectedCategory: 'Câmbio', vehicle });
      expect([vehicle.modelo, engine[0].causeName]).toEqual([vehicle.modelo, 'Coxins do motor desgastados ou rompidos']);
      expect(transmission[0].causeName).toBe('Coxim de câmbio desgastado ou rompido');
    }
  }, 30000);

  it('retorna e persiste hipóteses e guias sem misturar os apoios de motor e câmbio', async () => {
    const vehicle = await Vehicle.create({ modelo: 'Palio', ano: 2014, motorizacao: '1.6 E.torQ', tipo_cambio: 'Manual', quilometragem: 80000 });
    const response = await request(app).post(`/api/vehicles/${vehicle.id}/diagnose`).send({
      selectedCategory: 'Motor', description: 'vibrando muito parado no neutro e trancos no câmbio'
    });
    expect(response.status).toBe(200);
    const engine = response.body.find(r => r.causes[0].nome === 'Coxins do motor desgastados ou rompidos');
    const transmission = response.body.find(r => r.causes[0].nome === 'Coxim de câmbio desgastado ou rompido');
    expect(engine.id).not.toBe(transmission.id);
    for (const result of [engine, transmission]) {
      expect(result.match.purchaseRecommended).toBe(true);
      const cause = await Cause.findByPk(result.causes[0].id);
      expect(cause.symptomId).toBe(result.id);
      const guide = await RepairGuide.findByPk(result.causes[0].repairGuides[0].id);
      expect(guide.causeId).toBe(cause.id);
      expect(guide.titulo).toMatch(/coxim|coxins/);
    }
  });
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
    expect(response.body.some(v => v.modelo === 'Argo')).toBe(true);
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

describe('Diagnosis API Integrations', () => {
  let testVehicle;

  beforeEach(async () => {
    testVehicle = await Vehicle.create({
      modelo: 'Mobi',
      ano: 2022,
      motorizacao: '1.0 Firefly',
      quilometragem: 30000,
      tipo_cambio: 'Manual'
    });
  });

  it('deve retornar hipóteses com evidência de correspondência', async () => {
    const response = await request(app)
      .post(`/api/vehicles/${testVehicle.id}/diagnose`)
      .send({
        selectedCategory: 'Freios',
        description: 'sinto um barulho de atrito de metal raspando ao frear o carro nas pastilhas'
      });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body.length).toBeLessThanOrEqual(5);
    const names = response.body.map(s => s.nome);
    const hasFreioResult = names.some(n => /(freio|pastilha|atrito|disco|barulho)/i.test(n));
    expect(hasFreioResult).toBe(true);
    expect(response.body[0]).toHaveProperty('match.confidence');
    expect(response.body[0].match).toHaveProperty('evidence');
    expect(response.body[0].causes[0]).toHaveProperty('nome');
  });

  it('não deve preencher resultados sem evidência de correspondência', async () => {
    const response = await request(app)
      .post(`/api/vehicles/${testVehicle.id}/diagnose`)
      .send({
        selectedCategory: 'Motor',
        description: 'coisas estranhas aleatorias sem palavras chave mapeadas'
      });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toEqual([]);
  });

  it('deve retornar 404 se o veículo não existir', async () => {
    const response = await request(app)
      .post('/api/vehicles/999999/diagnose')
      .send({
        selectedCategory: 'Motor',
        description: 'motor falhando'
      });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Veículo não encontrado.');
  });

  it('deve retornar 400 se nenhum relato ou termo de pesquisa for enviado', async () => {
    const response = await request(app)
      .post(`/api/vehicles/${testVehicle.id}/diagnose`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Descreva ou pesquise pelo menos um sintoma.');
  });
});

describe('Carga inicial dos catálogos', () => {
  it('deve carregar a base TCC completa e não duplicar registros ao repetir o seed', async () => {
    const { SymptomCatalog, CauseCatalog, RepairGuideCatalog } = require('../models');
    const data = require('../config/tcc_symptoms.json');
    const counts = async () => Promise.all([
      VehicleCatalog.count(), SymptomCatalog.count(), CauseCatalog.count(), RepairGuideCatalog.count()
    ]);
    const before = await counts();
    expect(before[0]).toBeGreaterThan(0);
    expect(before[1]).toBe(data.length);
    expect(before[2]).toBe(data.reduce((sum, symptom) => sum + (symptom.causes || []).length, 0));
    expect(before[3]).toBe(data.reduce((sum, symptom) => sum + (symptom.causes || []).reduce((total, cause) => total + (cause.repairGuides || []).length, 0), 0));
    await seedDatabase();
    expect(await counts()).toEqual(before);
  });
});

describe('Regressão HTTP do relato literal de freios', () => {
  it('deve persistir triagem moderada com guia sem indicar compra de peça não identificada', async () => {
    const vehicle = await Vehicle.create({ modelo: 'Palio', ano: 2014, motorizacao: '1.6 E.torQ', quilometragem: 80000, tipo_cambio: 'Manual' });
    const response = await request(app).post(`/api/vehicles/${vehicle.id}/diagnose`)
      .send({ selectedCategory: 'Freios', description: 'Barulho ao frear.' });
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
    for (const hypothesis of response.body) {
      expect(hypothesis.vehicleId).toBe(vehicle.id);
      expect(hypothesis.match.confidence).toBe('Moderada');
      expect(hypothesis.match.purchaseRecommended).toBe(false);
      expect(hypothesis.causes[0].repairGuides.length).toBeGreaterThan(0);
      const cause = await Cause.findByPk(hypothesis.hypothesisId);
      expect(cause.descricao).toContain('não identifica a peça defeituosa');
      expect(cause.probabilidade).toBeNull();
    }
  });
});

