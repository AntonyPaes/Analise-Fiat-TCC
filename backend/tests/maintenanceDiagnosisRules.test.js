const { rankDiagnosis, shouldRecommendPartSearch } = require('../services/diagnosisService');
const catalog = require('../config/tcc_symptoms.json');
const diesel = { modelo: 'Toro', ano: 2026, motorizacao: '2.2 Turbodiesel' };
const diagnose = (query, selectedCategory = 'Suspensão', vehicle = {}, source = catalog) =>
  rankDiagnosis({ catalog: source, query, selectedCategory, vehicle });

describe('Reconhecimento de suspensão', () => {
  test.each(['suspensão ta balançando muito', 'a suspensão está oscilando', 'suspensão quicando', 'carro balança muito'])('%s prioriza amortecedor', query => {
    const [result] = diagnose(query);
    expect(result.causeName).toBe('Amortecedor desgastado ou estourado');
    expect(result.purchaseRecommended).toBe(true);
    expect(result.purchaseParts).toEqual(['Amortecedor']);
    expect(result.causeDescription).toContain('confirmada');
  });
  test('batida dianteira limita a cinco causas com peças e guias próprios', () => {
    const results = diagnose('suspensão dianteira batendo');
    expect(results).toHaveLength(5);
    for (const word of ['Batente', 'Coxim', 'Amortecedor', 'bandeja', 'Pivô']) {
      expect(results.some(r => r.causeName.includes(word))).toBe(true);
    }
    expect(results.every(r => r.cause.repairGuides.length && r.purchaseParts.length && r.purchaseRecommended)).toBe(true);
    expect(results.find(r => r.causeName.startsWith('Coxim')).purchaseParts).toContain('Coxim do amortecedor dianteiro');
  });
  test.each(['sem balanço na suspensão', 'suspensão não está balançando', 'suspensão não ta balançando muito', 'suspensão dianteira sem batidas', 'suspensão dianteira não está batendo', 'balançando no neutro'])('não inventa suspensão para %s', query => {
    const results = diagnose(query, query === 'balançando no neutro' ? 'Motor' : 'Suspensão');
    expect(results.filter(r => r.symptom.id === 'maintenance-rule:suspension')).toEqual([]);
  });
  test('reconhece suspensão mesmo se a categoria escolhida for outra', () => {
    const [result] = diagnose('suspensão dianteira batendo', 'Motor');
    expect(result.categoryMismatch).toBe(true);
    expect(result.category).toBe('Suspensão');
  });
});

describe('Compatibilidade com diesel', () => {
  test.each(['diesel demora a pegar no frio', 'dificuldade de partida a frio', 'vela aquecedora queimada'])('%s indica pré-aquecimento', query => {
    const [result] = diagnose(query, 'Motor', diesel);
    expect(result.causeName).toContain('Velas aquecedoras');
    expect(result.purchaseParts).toEqual(['Vela aquecedora diesel']);
    expect(result.purchaseRecommended).toBe(true);
  });
  test('não recomenda pré-aquecimento para motor flex ou balanço da suspensão', () => {
    expect(diagnose('demora a pegar no frio', 'Motor', { motorizacao: '1.0 Firefly' }).some(r => r.purchaseParts?.includes('Vela aquecedora diesel'))).toBe(false);
    expect(diagnose('suspensão balançando', 'Suspensão', diesel).some(r => r.purchaseParts?.includes('Vela aquecedora diesel'))).toBe(false);
  });
  test('filtra centelha de catálogos antigos e retira instruções incompatíveis de guias mistos', () => {
    const oldCatalog = [{ id: 1, nome: 'Motor falhando', categoria: 'Motor', keywords: ['motor', 'falha'], causes: [
      { nome: 'Velas de ignição', repairGuides: [{ titulo: 'Troca das velas' }] },
      { nome: 'Bobina de ignição', repairGuides: [{ titulo: 'Troca da bobina' }] },
      { nome: 'Cabos de vela', repairGuides: [{ titulo: 'Troca dos cabos' }] },
      { nome: 'Injetor entupido', descricao: 'Testar velas e injetores.', repairGuides: [{ titulo: 'Verificação do motor', passos: 'Trocar velas e bobinas.' }] }
    ] }];
    const results = diagnose('motor falhando', 'Motor', diesel, oldCatalog);
    expect(results.map(r => r.causeName)).toEqual(['Injetor entupido']);
    expect(JSON.stringify(results[0].cause.repairGuides)).not.toMatch(/velas|bobinas/);
    expect(results[0].causeDescription).not.toContain('velas');
    expect(diagnose('motor falhando', 'Motor', { motorizacao: '1.3 Flex' }, oldCatalog)).toHaveLength(4);
  });
});

describe('Iluminação e peças para compra', () => {
  test.each(['farol baixo queimado', 'farol alto não acende', 'lanterna traseira apagada', 'luz de freio não acende'])('%s oferece alternativas de lâmpada e conjunto LED', query => {
    const [result] = diagnose(query, 'Elétrica', { modelo: 'Palio', ano: 2014 });
    expect(result.purchaseRecommended).toBe(true);
    expect(result.purchaseParts).toHaveLength(2);
    expect(result.purchaseParts[0]).toContain('Lâmpada');
    expect(result.purchaseParts[1]).toContain('LED completo');
    expect(result.lightingNotice).toContain('lâmpada removível');
    expect(result.cause.repairGuides[0].passos).toContain('LED integrado');
  });
  test.each(['farol de LED não acende', 'lanterna de LED queimada'])('%s oferece somente conjunto completo', query => {
    const results = diagnose(query, 'Elétrica');
    expect(results.length).toBeGreaterThan(0);
    for (const result of results.filter(r => r.lightingNotice)) {
      expect(result.purchaseParts).toHaveLength(1);
      expect(result.purchaseParts[0]).toContain('LED completo');
      expect(result.causeName).not.toMatch(/lâmpada/i);
      expect(result.cause.repairGuides[0].passos).not.toContain('substitua a lâmpada');
    }
  });
  test('farol da Toro 2026 é tratado como full-LED sem depender do texto do relato', () => {
    const [result] = diagnose('farol baixo queimado', 'Elétrica', diesel);
    expect(result.purchaseParts).toEqual(['Farol LED completo']);
    expect(result.causeName).toContain('LED integrado');
  });
  test('negação de LED mantém as alternativas, sem supor a versão', () => {
    const [result] = diagnose('farol não é LED e está queimado', 'Elétrica');
    expect(result.purchaseParts).toHaveLength(2);
  });
  test.each(['farol não está queimado', 'lanterna sem falha', 'motor não liga'])('não cria falha de iluminação para %s', query => {
    expect(diagnose(query, 'Elétrica').filter(r => r.symptom.id === 'maintenance-rule:lighting')).toEqual([]);
  });
  test('catálogo antigo de lâmpada também recebe as duas opções de compra', () => {
    const oldCatalog = [{ id: 5, nome: 'Farol baixo queimado', categoria: 'Elétrica', keywords: ['farol'], causes: [{
      nome: 'Lâmpada do farol queimada', repairGuides: [{ titulo: 'Troca da lâmpada do farol', passos: 'Substitua a lâmpada.' }]
    }] }];
    const results = diagnose('farol baixo queimado', 'Elétrica', {}, oldCatalog);
    expect(results.find(r => r.symptom.id === 5).purchaseParts).toEqual(['Lâmpada do farol', 'Farol LED completo']);
  });
  test('troca de lâmpada habilita compra, inspeção isolada não', () => {
    expect(shouldRecommendPartSearch('Lâmpada queimada', { titulo: 'Troca da lâmpada' })).toBe(true);
    expect(shouldRecommendPartSearch('Lâmpada queimada', { titulo: 'Inspeção da lâmpada' })).toBe(false);
  });
});
