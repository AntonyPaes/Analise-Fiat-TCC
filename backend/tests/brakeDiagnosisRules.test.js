const { rankDiagnosis } = require('../services/diagnosisService');
const catalog = require('../config/tcc_symptoms.json');
const legacyCatalog = require('../config/symptoms_catalog');
const diagnose = (query, selectedCategory = 'Freios', source = catalog, options = {}) =>
  rankDiagnosis({ catalog: source, query, selectedCategory, ...options });

describe('Alavanca mecânica do freio de mão', () => {
  test.each([
    'falta de pressão na alavanca', 'alavanca não funciona',
    'alavanca não trava e não faz barulho', 'alavanca sem resistência',
    'alavanca não faz cliques', 'alavanca não faz mais barulho',
    'alavanca desce sozinha', 'alavanca não fica levantada',
    'alavanca muito mole', 'alavanca frouxa', 'catraca do freio de mão não trava',
    'freio de estacionamento não funciona', 'freio de mão solto',
    'puxo a alavanca e não sinto resistência'
  ])('recomenda verificar e trocar a alavanca para: %s', query => {
    const [result] = diagnose(query);
    expect(result.causeName).toContain('Alavanca do freio de mão');
    expect(result.purchaseRecommended).toBe(true);
    expect(result.purchaseParts).toEqual(['Alavanca do freio de mão']);
    expect(result.cause.repairGuides[0].passos).toContain('cabos');
    expect(result.cause.repairGuides[0].passos).toContain('recall');
  });
  test.each([
    ['alavanca do câmbio não funciona', 'Freios'], ['alavanca de marcha muito solta', 'Transmissão'],
    ['pedal de freio sem pressão', 'Freios'], ['alavanca funciona normalmente', 'Freios'],
    ['alavanca não está mole', 'Freios'], ['alavanca não faz barulho', 'Motor']
  ])('não confunde outro componente ou funcionamento normal: %s', (query, category) => {
    expect(diagnose(query, category).filter(r => r.symptom.id === 'brake-rule:handbrake-lever')).toEqual([]);
  });
  test('contexto explícito funciona sem categoria e em qualquer modelo', () => {
    for (const modelo of ['Palio', 'Argo', 'Toro', 'Ducato']) {
      expect(diagnose('freio de mão não trava', '', [], { vehicle: { modelo } })[0].purchaseParts).toEqual(['Alavanca do freio de mão']);
    }
  });
});

describe('Compra de fluido DOT4', () => {
  test('nível baixo retorna fluido com compra e especificação', () => {
    const [result] = diagnose('Fluido de freio abaixo do nível');
    expect(result.purchaseRecommended).toBe(true);
    expect(result.purchaseParts).toEqual(['Fluido de freio DOT4']);
    expect(result.causeDescription).toContain('especificação do veículo');
  });
  test('causa legada de nível baixo com orientação de completar DOT4 também recebe o link', () => {
    const results = diagnose('luz do freio de mão ABS acesa no painel', 'Freios', legacyCatalog);
    const result = results.find(r => r.causeName === 'Fluido de freio abaixo do nível');
    expect(result.purchaseRecommended).toBe(true);
    expect(result.purchaseParts).toEqual(['Fluido de freio DOT4']);
  });
  test('troca indicada em guia legado usa DOT4 no nome da peça', () => {
    const results = diagnose('pedal de freio fofo ou baixo ao pisar', 'Freios', legacyCatalog);
    expect(results.some(r => r.purchaseParts?.includes('Fluido de freio DOT4'))).toBe(true);
  });
  test.each(['fluido de freio não está abaixo do nível', 'fluido do câmbio baixo'])('não cria indicação de fluido de freio para: %s', query => {
    expect(diagnose(query, 'Transmissão').filter(r => r.symptom.id === 'brake-rule:low-brake-fluid')).toEqual([]);
  });
});

describe('Limite obrigatório de causas', () => {
  test.each([undefined, 5, 7, 100, 0, -1, null])('suspensão nunca retorna mais de cinco, mesmo com limit=%s', limit => {
    expect(diagnose('suspensão dianteira batendo', 'Suspensão', catalog, { limit })).toHaveLength(5);
  });
  test('limite menor continua sendo respeitado', () => {
    expect(diagnose('suspensão dianteira batendo', 'Suspensão', catalog, { limit: 2 })).toHaveLength(2);
  });
});
