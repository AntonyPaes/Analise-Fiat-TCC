function getMountHypotheses({ query, selectedCategory, vehicle, normalize, tokenize, getNegatedTerms }) {
  const text = normalize(query);
  const category = normalize(selectedCategory);
  const negated = getNegatedTerms(query);
  const terms = new Set(tokenize(query).filter(term => !negated.has(term)));
  const stationary = /\b(parad[oa]|imobilizad[oa]|neutro|ponto morto|marcha lenta|baixa rotacao|ralenti|repouso|sem acelerar|sem sair do lugar|ao parar|quando (?:paro|para))\b|\b(?:em|no) n\b/.test(text)
    && !/\b(?:nao|nunca) (?:esta |fica |no |em )?(?:parad[oa]|imobilizad[oa]|neutro|ponto morto|marcha lenta|ralenti)\b/.test(text);
  const engineContext = category === 'motor' || !category || /\bmotor\b/.test(text);
  const engineVibration = engineContext && stationary && ['vibracao', 'balanco'].some(term => terms.has(term));
  const transmissionContext = /\b(cambio|transmissao|marcha|marchas|engatar|engate|engato|engata|engatando)\b/.test(text)
    || /cambio|transmissao/.test(category);
  const transmissionImpact = transmissionContext
    && (['tranco', 'solavanco', 'impacto', 'pancada', 'batida', 'chute', 'coice'].some(term => terms.has(term))
      || (/\b(?:trocas?|engates?) (?:de marcha )?brusc[oa]s?\b|\b(?:troca|engata) (?:a marcha )?bruscamente\b/.test(text)
        && !/\b(?:nao|sem) (?:tem |faz )?(?:(?:trocas?|engates?) (?:de marcha )?brusc[oa]s?|(?:troca|engata) (?:a marcha )?bruscamente)\b/.test(text)));
  const hypotheses = [];

  const add = (id, nome, categoria, causes, evidence) => {
    const symptom = { id: `mount-rule:${id}`, nome, categoria, descricao: evidence, codigo_obd: null };
    for (const [index, cause] of causes.entries()) {
      hypotheses.push({
        symptom, cause, causeName: cause.nome, causeDescription: cause.descricao,
        isComponentList: false, confidence: 'Moderada', score: 0, priority: 100 - index,
        evidence: [`Relato reconhecido: ${evidence}`, `Hipótese a verificar: ${cause.nome}`],
        vehicleFit: 'unknown', category: categoria,
        categoryMismatch: Boolean(selectedCategory) && normalize(categoria) !== category
      });
    }
  };

  const mountCause = (transmission) => {
    const part = transmission ? 'coxim de câmbio' : 'coxins do motor';
    return {
      nome: transmission ? 'Coxim de câmbio desgastado ou rompido' : 'Coxins do motor desgastados ou rompidos',
      descricao: transmission
        ? 'O coxim de câmbio é a hipótese prioritária para este relato de trancos, solavancos ou impactos na transmissão. Verifique folgas e fixações; recomenda-se a troca do coxim se o desgaste ou rompimento for confirmado. Embreagem, funcionamento interno e controle do câmbio também devem ser avaliados se o coxim estiver íntegro.'
        : 'Os coxins do motor são a hipótese prioritária para este relato de vibração com o veículo parado, em neutro ou em marcha lenta. Inspecione borrachas, fixações e possíveis vazamentos dos apoios hidráulicos; recomenda-se substituir os coxins com defeito confirmado.',
      repairGuides: [{
        titulo: transmission ? 'Inspeção e troca do coxim de câmbio' : 'Inspeção e substituição dos coxins do motor',
        descricao: `Confirmar o estado dos apoios antes da troca de ${part}.`,
        passos: [
          '1. Em oficina, reproduza o sintoma com o veículo imobilizado e verifique folgas, borrachas rompidas e fixações dos apoios.',
          '2. Confirme qual apoio está danificado e consulte a peça, o procedimento e os torques específicos do modelo, ano, motor e câmbio.',
          '3. Apoie o conjunto motopropulsor com equipamento apropriado antes de soltar qualquer fixação.',
          `4. Substitua ${part} somente se o defeito for confirmado e aplique os torques especificados pelo fabricante.`,
          '5. Confira as fixações e repita o teste para verificar se a vibração ou os trancos foram eliminados.'
        ].join('\n'),
        dificuldade: 'Mediano', ferramentas: 'Equipamento de sustentação do conjunto motopropulsor, torquímetro e ferramentas específicas do veículo'
      }]
    };
  };

  if (engineVibration) {
    const causes = [mountCause(false)];
    if (!/diesel|multijet|jtd/i.test(vehicle?.motorizacao || '')) {
      causes.push({
        nome: 'Falha de ignição (velas, cabos ou bobinas)',
        descricao: 'Falhas de combustão também podem causar vibração em marcha lenta, principalmente com funcionamento irregular. Teste velas, cabos quando existentes e bobinas antes de substituir componentes.',
        repairGuides: [{
          titulo: 'Verificação do sistema de ignição',
          descricao: 'Identificar falhas de combustão e testar os componentes aplicáveis à motorização.',
          passos: '1. Leia códigos de falha e contadores de falhas de combustão com scanner.\n2. Com o motor desligado, inspecione velas, conectores, cabos quando existentes e bobinas.\n3. Teste os componentes segundo o manual e repare somente os defeitos confirmados.\n4. Repita a avaliação de marcha lenta.',
          dificuldade: 'Mediano', ferramentas: 'Scanner e ferramentas de teste de ignição'
        }]
      });
    }
    causes.push({
      nome: 'Bicos injetores sujos ou entupidos',
      descricao: 'Vazão irregular dos injetores pode provocar combustão desigual e vibração em marcha lenta. Confirme o desequilíbrio por testes antes de indicar limpeza ou substituição.',
      repairGuides: [{
        titulo: 'Teste de vazão e avaliação dos bicos injetores',
        descricao: 'Avaliar alimentação, equilíbrio e estanqueidade dos injetores em oficina.',
        passos: '1. Leia falhas e parâmetros da injeção com scanner.\n2. Verifique alimentação e pressão de combustível conforme a motorização.\n3. Solicite teste de equilíbrio, vazão e estanqueidade com equipamento adequado, especialmente em sistemas diesel de alta pressão.\n4. Realize limpeza somente quando indicada pelo teste e valide a marcha lenta.',
        dificuldade: 'Mediano', ferramentas: 'Scanner e equipamento de teste de injetores adequado à motorização'
      }]
    });
    add('engine-idle', 'Vibração com o veículo parado ou em neutro', 'Motor', causes, 'Vibração com o veículo parado, em neutro ou em marcha lenta.');
  }
  if (transmissionImpact) {
    add('transmission-impact', 'Trancos, solavancos ou impactos no câmbio', 'Câmbio', [mountCause(true)], 'Trancos, solavancos ou impactos no câmbio.');
  }
  return hypotheses;
}

module.exports = { getMountHypotheses };
