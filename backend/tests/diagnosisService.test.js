const { rankDiagnosis, shouldRecommendPartSearch } = require('../services/diagnosisService');
const tccCatalog = require('../config/tcc_symptoms.json');

const makeCatalog = () => [
  {
    id: 1,
    nome: 'Motor falhando',
    categoria: 'Motor',
    keywords: ['falha', 'engasgo', 'perda de potência'],
    causes: [
      { nome: 'Velas de ignição desgastadas', descricao: 'A centelha fica irregular.' },
      { nome: 'Bobina de ignição defeituosa', descricao: 'A bobina pode falhar sob carga.' }
    ]
  },
  {
    id: 2,
    nome: 'Vibração ao frear',
    categoria: 'Freios',
    keywords: ['vibração', 'trepidação', 'frear', 'disco'],
    causes: [{ nome: 'Disco de freio empenado', descricao: 'O disco pode gerar pulsação no pedal.' }]
  },
  {
    id: 3,
    nome: 'Ruído ao frear',
    categoria: 'Freios',
    keywords: ['barulho', 'ruído', 'chiado', 'frear'],
    causes: [{ nome: 'Pastilhas; discos; pinças, conforme diagnóstico', descricao: 'Componentes a verificar.' }]
  }
];

describe('diagnosisService relevance', () => {
  it('returns no catalog fallback for vague or unrelated descriptions', () => {
    const results = rankDiagnosis({ catalog: makeCatalog(), query: 'coisas estranhas aleatorias', selectedCategory: 'Motor' });
    expect(results).toEqual([]);
  });

  it('ranks distinct causes individually and reports the terms that matched', () => {
    const results = rankDiagnosis({
      catalog: makeCatalog(),
      query: 'motor falhando com falha na vela e na bobina',
      selectedCategory: 'Motor'
    });

    expect(results.map((result) => result.causeName)).toEqual(expect.arrayContaining([
      'Velas de ignição desgastadas',
      'Bobina de ignição defeituosa'
    ]));
    expect(results.every((result) => result.evidence.length > 1)).toBe(true);
  });

  it('can find a relevant result when the selected category is wrong', () => {
    const [result] = rankDiagnosis({
      catalog: makeCatalog(),
      query: 'motor falhando com perda de potência',
      selectedCategory: 'Freios'
    });

    expect(result.category).toBe('Motor');
    expect(result.categoryMismatch).toBe(true);
  });

  it('does not present a generic component list as a confirmed cause', () => {
    const withoutComponentEvidence = rankDiagnosis({
      catalog: makeCatalog(),
      query: 'ruído ao frear',
      selectedCategory: 'Freios'
    });
    expect(withoutComponentEvidence).toEqual([]);

    const withComponentEvidence = rankDiagnosis({
      catalog: makeCatalog(),
      query: 'ruído ao frear com pastilhas raspando',
      selectedCategory: 'Freios'
    });
    expect(withComponentEvidence.some((result) => result.causeName === 'Pastilhas' && result.isComponentList)).toBe(true);
  });

  it('uses negation so a denied noise does not match a noise hypothesis', () => {
    const results = rankDiagnosis({
      catalog: makeCatalog(),
      query: 'o freio está sem barulho',
      selectedCategory: 'Freios'
    });
    expect(results).toEqual([]);
  });

  it('does not recommend a cause whose defining condition is explicitly denied', () => {
    const catalog = [{
      nome: 'Motor não liga', categoria: 'Motor', keywords: ['partida', 'liga'],
      causes: [{ nome: 'Bateria descarregada', descricao: 'A bateria perdeu carga.' }]
    }];
    const results = rankDiagnosis({
      catalog,
      query: 'motor não liga e a bateria não está descarregada',
      selectedCategory: 'Motor'
    });
    expect(results).toEqual([]);
  });

  it('can return multiple symptoms from a combined report', () => {
    const results = rankDiagnosis({
      catalog: makeCatalog(),
      query: 'motor falhando e vibração forte ao frear',
      selectedCategory: 'Motor'
    });
    expect(new Set(results.map((result) => result.category))).toEqual(new Set(['Motor', 'Freios']));
  });

  it('filters out catalog applications that conflict with the selected vehicle', () => {
    const catalog = [{
      id: 4,
      nome: 'Vibração ao frear',
      categoria: 'Freios',
      keywords: ['vibração', 'frear'],
      causes: [{
        nome: 'Disco de freio empenado',
        descricao: 'Aplicação: Argo 2018-2021; Evidência: aplicação específica.',
        repairGuides: []
      }]
    }];

    expect(rankDiagnosis({ catalog, query: 'vibração ao frear disco', vehicle: { modelo: 'Mobi' } })).toEqual([]);
    const [compatible] = rankDiagnosis({ catalog, query: 'vibração ao frear disco', vehicle: { modelo: 'Argo', ano: 2020 } });
    expect(compatible.vehicleFit).toBe('match');

    expect(rankDiagnosis({ catalog, query: 'vibração ao frear disco', vehicle: { modelo: 'Argo', ano: 2024 } })).toEqual([]);
  });

  it('limits the response to five distinct hypotheses', () => {
    const catalog = Array.from({ length: 8 }, (_, index) => ({
      id: index,
      nome: 'Motor falhando',
      categoria: 'Motor',
      keywords: ['falha', 'engasgo', 'potência'],
      causes: [{ nome: `Bobina de ignição ${index}`, descricao: 'Falha no sistema de ignição.' }]
    }));
    const results = rankDiagnosis({ catalog, query: 'motor falhando engasgo', limit: 5 });
    expect(results).toHaveLength(5);
  });

  it('recommends a marketplace search only for an explicit replacement of a named part', () => {
    expect(shouldRecommendPartSearch('Pastilha de freio gasta', {
      titulo: 'Substituição da pastilha de freio'
    })).toBe(true);
    expect(shouldRecommendPartSearch('Pastilha de freio gasta', {
      titulo: 'Inspeção e limpeza do conjunto de freio'
    })).toBe(false);
    expect(shouldRecommendPartSearch('Pastilha; disco; pinça', {
      titulo: 'Substituição de componente confirmado'
    }, true)).toBe(true);
  });

  it('recognizes replacement actions in generic catalog procedures for a named cause', () => {
    expect(shouldRecommendPartSearch('Alternador com falha', {
      titulo: 'Fluxo de Reparo: Motor não liga',
      passos: 'Confirmar o sintoma; reparar/substituir o componente confirmado; fazer teste.'
    })).toBe(true);
    expect(shouldRecommendPartSearch('Nível de óleo baixo', {
      titulo: 'Verificação do nível',
      passos: 'Inspecionar e completar o nível conforme especificação.'
    })).toBe(false);
  });

  it('does not turn a generic vehicle word into an unrelated TCC result', () => {
    expect(rankDiagnosis({
      catalog: tccCatalog,
      query: 'carro não liga',
      selectedCategory: 'Motor',
      vehicle: { modelo: 'Mobi', ano: 2022 }
    })).toEqual([]);
  });

  it('uses specific words in a realistic braking report to return component candidates', () => {
    const results = rankDiagnosis({
      catalog: tccCatalog,
      query: 'barulho ao frear com pastilhas raspando',
      selectedCategory: 'Motor',
      vehicle: { modelo: 'Mobi', ano: 2022 }
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(5);
    expect(results.every((result) => result.category === 'Freios')).toBe(true);
    expect(results.every((result) => result.categoryMismatch)).toBe(true);
    expect(results.some((result) => result.causeName.toLowerCase().includes('pastilh'))).toBe(true);
  });
});
