const { rankDiagnosis, shouldRecommendPartSearch } = require('../services/diagnosisService');
const catalog = require('../config/tcc_symptoms.json');

const diagnose = (query, selectedCategory = 'Motor', vehicle = { modelo: 'Palio', motorizacao: '1.6 E.torQ' }) =>
  rankDiagnosis({ catalog, query, selectedCategory, vehicle });

describe('Hipóteses compartilhadas de coxins', () => {
  test.each([
    'o veículo está vibrando muito parado', 'vibrando muito no neutro',
    'motor vibra em ponto morto', 'carro tremendo em marcha lenta',
    'trepidação com o carro parado', 'vibração em ralenti', 'VIBRAÇÃO no NEUTRO',
    'motor chacoalhando quando paro', 'motor sacudindo em baixa rotação',
    'carro com tremedeira sem acelerar', 'carro balança parado', 'começa a tremer ao parar no sinal',
    'motor trepidando com o veículo imobilizado', 'motor vibrando em N'
  ])('prioriza coxins e inclui alternativas para: %s', query => {
    const results = diagnose(query);
    expect(results[0].causeName).toBe('Coxins do motor desgastados ou rompidos');
    expect(results[0].purchaseRecommended).toBe(true);
    expect(results[0].confidence).toBe('Moderada');
    expect(results[0].cause.repairGuides[0].titulo).toContain('coxins do motor');
    expect(results.map(r => r.causeName)).toEqual(expect.arrayContaining([
      'Falha de ignição (velas, cabos ou bobinas)', 'Bicos injetores sujos ou entupidos'
    ]));
  });

  test.each(['solavancos no câmbio', 'trancos na transmissão', 'impactos no câmbio', 'tranco ao engatar a marcha',
    'pancada ao engatar marcha', 'câmbio dá coices', 'trocas bruscas no câmbio', 'transmissão engata bruscamente',
    'batidas quando engato a marcha', 'câmbio dá chutes'])('%s recomenda coxim de câmbio', query => {
    const [result] = diagnose(query);
    expect(result.causeName).toBe('Coxim de câmbio desgastado ou rompido');
    expect(result.purchaseRecommended).toBe(true);
    expect(result.categoryMismatch).toBe(true);
    expect(result.cause.repairGuides[0].titulo).toContain('troca do coxim de câmbio');
  });

  test('a categoria câmbio fornece contexto para um relato curto', () => {
    const [result] = diagnose('muitos trancos', 'Câmbio');
    expect(result.causeName).toContain('Coxim de câmbio');
    expect(result.categoryMismatch).toBe(false);
  });

  test.each([
    ['motor não vibra parado', 'Motor'], ['sem vibração no neutro', 'Motor'],
    ['não está tremendo em marcha lenta', 'Motor'], ['vibra andando mas não parado', 'Motor'],
    ['sem trancos no câmbio', 'Câmbio'], ['não tem solavancos na transmissão', 'Câmbio'],
    ['sem impactos no câmbio', 'Câmbio'], ['solavancos na suspensão', 'Suspensão'],
    ['volante vibra a 100 km/h', 'Motor'], ['vibração ao frear', 'Freios'],
    ['vibrando parado', 'Freios'], ['carro parado no neutro', 'Motor'],
    ['motor sem tremedeira parado', 'Motor'], ['sem pancadas no câmbio', 'Câmbio'],
    ['câmbio não faz trocas bruscas', 'Câmbio'], ['motor não balança parado', 'Motor']
  ])('não aciona regra indevida para %s (%s)', (query, category) => {
    expect(diagnose(query, category).filter(r => String(r.symptom.id).startsWith('mount-rule:'))).toEqual([]);
  });

  test('diesel recebe coxins e injetores sem hipótese de ignição por centelha', () => {
    const results = diagnose('vibrando parado', 'Motor', { modelo: 'Ducato', motorizacao: '2.3 Multijet Diesel' });
    expect(results[0].causeName).toContain('Coxins do motor');
    expect(results.some(r => r.causeName === 'Bicos injetores sujos ou entupidos')).toBe(true);
    expect(results.some(r => r.causeName === 'Falha de ignição (velas, cabos ou bobinas)')).toBe(false);
  });

  test('motor explícito funciona sem categoria e sinaliza categoria incorreta', () => {
    expect(diagnose('motor tremendo em marcha lenta', '')[0].causeName).toContain('Coxins do motor');
    const [result] = diagnose('motor tremendo em marcha lenta', 'Elétrica');
    expect(result.causeName).toContain('Coxins do motor');
    expect(result.categoryMismatch).toBe(true);
  });

  test('regras independem da versão do catálogo e preservam limite e sintomas distintos', () => {
    const results = rankDiagnosis({ catalog: [], query: 'vibra parado e dá trancos no câmbio', selectedCategory: 'Motor' });
    expect(new Set(results.map(r => r.symptom.id)).size).toBe(2);
    expect(results.map(r => r.causeName)).toEqual(expect.arrayContaining([
      'Coxins do motor desgastados ou rompidos', 'Coxim de câmbio desgastado ou rompido'
    ]));
    expect(rankDiagnosis({ catalog, query: 'vibrando parado', selectedCategory: 'Motor', limit: 1 })).toHaveLength(1);
  });

  test.each(['Coxins do motor desgastados', 'Coxim de câmbio rompido'])('busca de peça exige procedimento de troca: %s', name => {
    expect(shouldRecommendPartSearch(name, { titulo: 'Inspeção dos coxins' })).toBe(false);
    expect(shouldRecommendPartSearch(name, { titulo: 'Troca dos coxins' })).toBe(true);
  });
});
