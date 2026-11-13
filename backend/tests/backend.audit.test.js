const request = require('supertest');
const app = require('../app');
const db = require('../models');
const { sequelize, Vehicle, VehicleCatalog, Symptom, Cause, RepairGuide,
  SymptomCatalog, CauseCatalog, RepairGuideCatalog } = db;

const vehicleData = { modelo: 'Argo', ano: 2022, motorizacao: '1.0 Firefly', quilometragem: 1000, tipo_cambio: 'Manual' };
let vehicle;

beforeAll(async () => {
  if (sequelize.getDialect() !== 'sqlite' || process.env.NODE_ENV !== 'test') {
    throw new Error('Auditoria permitida somente no SQLite de teste.');
  }
  await sequelize.sync({ force: true });
});
beforeEach(async () => {
  jest.restoreAllMocks();
  await Vehicle.destroy({ where: {} });
  await SymptomCatalog.destroy({ where: {} });
  await VehicleCatalog.destroy({ where: {} });
  vehicle = await Vehicle.create(vehicleData);
});
afterAll(async () => sequelize.close());

async function catalog(code = 'P0300') {
  return SymptomCatalog.create({
    nome: 'Motor falhando', categoria: 'Motor', keywords: ['falha', 'bobina'], codigo_obd: code,
    causes: ['Bobina defeituosa', 'Vela desgastada'].map(nome => ({ nome, repairGuides: [{
      titulo: 'Inspecionar componente', passos: 'Testar antes de substituir.'
    }] }))
  }, { include: [{ model: CauseCatalog, as: 'causes', include: [{ model: RepairGuideCatalog, as: 'repairGuides' }] }] });
}
const diagnose = (id, body = { description: 'Motor falhando' }) => request(app).post(`/api/vehicles/${id}/diagnose`).send(body);

describe('Auditoria HTTP e persistência', () => {
  test('catálogos vazios respondem 200 e lista vazia', async () => {
    for (const path of ['/api/vehicles/options', '/api/symptoms/catalog']) {
      const response = await request(app).get(path);
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    }
  });
  test('opções eliminam duplicatas e ordenam modelo e ano', async () => {
    const data = { modelo: 'Argo', ano: 2021, motorizacao: '1.0', tipo_cambio: 'Manual' };
    await VehicleCatalog.bulkCreate([data, data, { ...data, ano: 2024 }, { ...data, modelo: 'Uno' }]);
    const response = await request(app).get('/api/vehicles/options');
    expect(response.status).toBe(200);
    expect(response.body.map(v => [v.modelo, v.ano])).toEqual([['Argo', 2024], ['Argo', 2021], ['Uno', 2021]]);
    expect(Object.keys(response.body[0]).sort()).toEqual(['ano', 'modelo', 'motorizacao', 'tipo_cambio']);
  });
  test('catálogo público expõe nome, descrição e categoria', async () => {
    await catalog();
    const response = await request(app).get('/api/symptoms/catalog');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ nome: 'Motor falhando', descricao: null, categoria: 'Motor' }]);
  });
  test.each(Object.keys(vehicleData))('cadastro rejeita ausência de %s sem gravar', async field => {
    const data = { ...vehicleData };
    delete data[field];
    const before = await Vehicle.count();
    expect((await request(app).post('/api/vehicles').send(data)).status).toBe(400);
    expect(await Vehicle.count()).toBe(before);
  });
  test('cadastro válido persiste todos os campos enviados', async () => {
    const response = await request(app).post('/api/vehicles').send(vehicleData);
    expect(response.status).toBe(201);
    expect((await Vehicle.findByPk(response.body.id)).toJSON()).toEqual(expect.objectContaining(vehicleData));
  });
  test.each([{}, { description: '   ' }, { description: 123 }, { description: [], searchTerm: {} }])('relato vazio ou não textual retorna 400: %j', async body => {
    expect((await diagnose(vehicle.id, body)).status).toBe(400);
    expect(await Symptom.count()).toBe(0);
  });
  test('diagnóstico aceita somente searchTerm sem categoria', async () => {
    await catalog();
    const response = await diagnose(vehicle.id, { searchTerm: 'Motor falhando' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });
  test.each(['P0300', 'TCC-001'])('persiste árvore, compartilha sintoma e filtra OBD %s', async code => {
    await catalog(code);
    const response = await diagnose(vehicle.id);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(await Symptom.count()).toBe(1);
    expect(await Cause.count()).toBe(2);
    expect(await RepairGuide.count()).toBe(2);
    for (const result of response.body) {
      expect(result.vehicleId).toBe(vehicle.id);
      expect(result.codigo_obd).toBe(code === 'P0300' ? code : null);
      expect(result.status).toBe('Pendente');
      expect(result.match.evidence.length).toBeGreaterThan(0);
      const cause = await Cause.findByPk(result.hypothesisId);
      expect(cause.symptomId).toBe(result.id);
      expect(cause.probabilidade).toBeNull();
      expect(result.causes[0].repairGuides[0].causeId).toBe(cause.id);
    }
  });
  test('relato sem correspondência não grava diagnóstico', async () => {
    await catalog();
    const response = await diagnose(vehicle.id, { description: 'xyz inexistente' });
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
    expect(await Symptom.count()).toBe(0);
  });
  test('JSON malformado retorna 400', async () => {
    const response = await request(app).post('/api/vehicles').set('Content-Type', 'application/json').send('{invalido');
    expect(response.status).toBe(400);
  });
  test('rota inexistente retorna 404', async () => {
    expect((await request(app).get('/api/inexistente')).status).toBe(404);
  });
  test.each([
    ['opções', VehicleCatalog, 'findAll', 'get', '/api/vehicles/options'],
    ['catálogo', SymptomCatalog, 'findAll', 'get', '/api/symptoms/catalog'],
    ['cadastro', Vehicle, 'create', 'post', '/api/vehicles'],
    ['diagnóstico', Vehicle, 'findByPk', 'post', null]
  ])('falha no banco retorna 500: %s', async (_, model, method, verb, path) => {
    jest.spyOn(model, method).mockRejectedValueOnce(new Error('Falha simulada'));
    const response = await request(app)[verb](path || `/api/vehicles/${vehicle.id}/diagnose`)
      .send(path === '/api/vehicles' ? vehicleData : { description: 'Motor falhando' });
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Falha simulada');
  });
  test('exclusão de veículo remove sintomas, causas e guias em cascata', async () => {
    await catalog();
    await diagnose(vehicle.id);
    expect(await RepairGuide.count()).toBe(2);
    await vehicle.destroy();
    expect(await Symptom.count()).toBe(0);
    expect(await Cause.count()).toBe(0);
    expect(await RepairGuide.count()).toBe(0);
    expect(await SymptomCatalog.count()).toBe(1);
  });
  test('palavras-chave preservam JSON e toleram armazenamento inválido', () => {
    const symptom = SymptomCatalog.build({ nome: 'Teste', categoria: 'Motor', keywords: ['ação', 'falha'] });
    expect(symptom.keywords).toEqual(['ação', 'falha']);
    symptom.setDataValue('keywords', '{invalido');
    expect(symptom.keywords).toEqual([]);
    symptom.keywords = null;
    expect(symptom.keywords).toEqual([]);
  });
  test.each([
    [Vehicle, {}], [VehicleCatalog, {}], [Symptom, {}], [Cause, {}],
    [RepairGuide, { titulo: 'Sem passos' }], [SymptomCatalog, { nome: 'Sem categoria' }],
    [CauseCatalog, {}], [RepairGuideCatalog, { titulo: 'Sem passos' }]
  ])('modelo %p rejeita campos obrigatórios ausentes', async (model, data) => {
    await expect(model.create(data)).rejects.toThrow();
  });
});

describe('Critérios de aceitação: validação e atomicidade', () => {
  test('veículo zero quilômetro deve ser aceito', async () => {
    expect((await request(app).post('/api/vehicles').send({ ...vehicleData, quilometragem: 0 })).status).toBe(201);
  });
  test.each([
    ['quilometragem negativa', { quilometragem: -1 }],
    ['ano textual', { ano: 'invalido' }],
    ['modelo em branco', { modelo: '   ' }],
    ['ano zero', { ano: 0 }],
    ['ano fracionário', { ano: 2022.5 }],
    ['ano acima de quatro dígitos', { ano: 10000 }],
    ['quilometragem fracionária', { quilometragem: 1.5 }],
    ['quilometragem textual', { quilometragem: 'abc' }],
    ['motorização em branco', { motorizacao: ' ' }],
    ['câmbio não textual', { tipo_cambio: 123 }]
  ])('cadastro deve rejeitar %s com 400', async (_, data) => {
    expect((await request(app).post('/api/vehicles').send({ ...vehicleData, ...data })).status).toBe(400);
  });
  test('falha ao gravar causa deve desfazer todo o diagnóstico', async () => {
    await catalog();
    jest.spyOn(Cause, 'create').mockRejectedValueOnce(new Error('Falha simulada ao gravar causa'));
    expect((await diagnose(vehicle.id)).status).toBe(500);
    expect(await Symptom.count()).toBe(0);
    expect(await Cause.count()).toBe(0);
  });
  test('falha ao gravar guia desfaz também sintoma e causa', async () => {
    await catalog();
    jest.spyOn(RepairGuide, 'create').mockRejectedValueOnce(new Error('Falha simulada no guia'));
    expect((await diagnose(vehicle.id)).status).toBe(500);
    expect(await Symptom.count()).toBe(0);
    expect(await Cause.count()).toBe(0);
    expect(await RepairGuide.count()).toBe(0);
  });
});
