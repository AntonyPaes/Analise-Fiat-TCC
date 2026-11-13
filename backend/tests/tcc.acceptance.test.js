const { normalize, tokenize, getCauseOptions, checkVehicleFit, rankDiagnosis } = require('../services/diagnosisService');
const catalog = require('../config/tcc_symptoms.json');
const vehicle = { modelo: 'Palio', ano: 2014, motorizacao: '1.6 E.torQ' };

describe('Critérios adicionais do roteiro TCC', () => {
  test('normalização remove acentos, pontuação e espaços excedentes', () => {
    expect(normalize('  VIBRAÇÃO, ao FREAR!  ')).toBe('vibracao ao frear');
  });
  test('sinônimos de ruído e vibração são normalizados', () => {
    expect(tokenize('barulho vibrando')).toEqual(['ruido', 'vibracao']);
  });
  test.each(['', '   ', '!!!', 'o carro e o veiculo'])('entrada sem evidência retorna lista vazia: %s', query => {
    expect(rankDiagnosis({ catalog, query, vehicle })).toEqual([]);
  });
  test('catálogo vazio não produz hipóteses', () => {
    expect(rankDiagnosis({ catalog: [], query: 'Motor falhando', vehicle })).toEqual([]);
  });
  test('causa genérica sem componente identificado é descartada', () => {
    expect(getCauseOptions({ nome: 'Peça causadora após diagnóstico' })).toEqual([]);
  });
  test('alternativas de causa são separadas', () => {
    expect(getCauseOptions({ nome: 'Bateria ou Alternador' }).map(c => c.name)).toEqual(['Bateria', 'Alternador']);
  });
  test('aplicação genérica permanece desconhecida', () => {
    expect(checkVehicleFit({}, { descricao: 'Aplicação: diversos modelos.' }, vehicle)).toBe('unknown');
  });
  test('aplicação em ano único incompatível é descartada', () => {
    expect(checkVehicleFit({}, { descricao: 'Aplicação: Palio 2015.' }, vehicle)).toBe('mismatch');
  });
  test('triagem elétrica de ausência de partida retorna hipóteses moderadas', () => {
    const results = rankDiagnosis({ catalog, query: 'carro não liga', selectedCategory: 'Elétrica', vehicle });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(r => r.category === 'Elétrica' && r.confidence === 'Moderada')).toBe(true);
  });
  test('TS07: relato literal Barulho ao frear deve apresentar hipóteses', () => {
    expect(rankDiagnosis({ catalog, query: 'Barulho ao frear.', selectedCategory: 'Freios', vehicle }).length).toBeGreaterThan(0);
  });
  test('relato sobre motor falhando não deve retornar falhas de chave ou controle remoto', () => {
    const results = rankDiagnosis({ catalog, query: 'motor falhando com vela', selectedCategory: 'Motor', vehicle });
    expect(results.filter(r => /chave presencial|controle remoto/i.test(r.symptom.nome))).toEqual([]);
  });
  test('triagem de ruído nos freios não confirma peça nem recomenda compra', () => {
    const results = rankDiagnosis({ catalog, query: 'Barulho ao frear.', selectedCategory: 'Freios', vehicle });
    expect(results.length).toBeGreaterThan(0);
    for (const result of results) {
      expect(result.category).toBe('Freios');
      expect(result.confidence).toBe('Moderada');
      expect(result.isComponentList).toBe(true);
      expect(result.purchaseRecommended).toBe(false);
      expect(result.causeDescription).toContain('não identifica a peça defeituosa');
      expect(result.cause.repairGuides.length).toBeGreaterThan(0);
    }
  });
  test.each(['sem barulho ao frear', 'não faz barulho ao frear', 'barulho'])('triagem não inventa contexto nem ignora negação: %s', query => {
    expect(rankDiagnosis({ catalog, query, selectedCategory: 'Freios', vehicle })).toEqual([]);
  });
  test('falha genérica não identifica chave sem contexto do título', () => {
    const entry = [{ nome: 'Chave presencial falhando', categoria: 'Elétrica', keywords: ['motor', 'falha'],
      causes: [{ nome: 'Motor', descricao: 'Componente elétrico' }] }];
    expect(rankDiagnosis({ catalog: entry, query: 'motor falhando', selectedCategory: 'Motor' })).toEqual([]);
    expect(rankDiagnosis({ catalog: entry, query: 'chave presencial falhando motor', selectedCategory: 'Elétrica' }).length).toBeGreaterThan(0);
  });
});
