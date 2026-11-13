function getWiperSignalHypotheses({ query, selectedCategory, normalize }) {
  const text = normalize(query);
  const results = [];
  const add = (id, nome, cause, priority) => results.push({
    symptom: { id: `visibility-rule:${id}`, nome, descricao: nome, categoria: 'Elétrica', codigo_obd: null },
    cause, causeName: cause.nome, causeDescription: cause.descricao,
    confidence: 'Moderada', isComponentList: false, score: 0, priority,
    category: 'Elétrica', categoryMismatch: Boolean(selectedCategory) && normalize(selectedCategory) !== 'eletrica',
    vehicleFit: 'unknown', evidence: [`Relato reconhecido: ${nome}`, `Hipótese a verificar: ${cause.nome}`],
    purchaseParts: cause.purchaseParts
  });
  const wiper = /\b(palheta|palhetas|limpador|limpadores)\b/.test(text);
  const rear = /\btraseir[oa]\b/.test(text);
  const bladeDamage = /\b(arranh\w*|risc\w*|rasp\w*|ressecad\w*|rasgad\w*|gasta|gastas|chiando|trepidando|pulando)\b|\b(?:deixa|deixando) (?:riscos|marcas|faixas|listras)|\bnao (?:esta )?limpa(?:ndo)? (?:direito|bem|o vidro)\b/.test(text)
    && !/\b(?:nao|sem) (?:esta |tem )?(?:arranh\w*|risc\w*|rasp\w*|chiando|trepidando|marcas)\b/.test(text);
  if (wiper && bladeDamage) {
    const part = rear ? 'Palheta do limpador traseiro' : 'Palheta do limpador de para-brisa';
    add('wiper-blade', 'Palheta arranhando o vidro ou limpando mal', {
      nome: 'Palheta do limpador desgastada ou danificada',
      descricao: 'Palheta que arranha, raspa, chia ou deixa faixas pode estar ressecada ou danificada. Inspecione sujeira no vidro, borracha e braço; recomenda-se trocar a palheta se o desgaste for confirmado, evitando novos riscos no vidro.',
      purchaseParts: [part],
      repairGuides: [{ titulo: 'Inspeção e troca da palheta do limpador',
        descricao: 'Conferir borracha, encaixe e medida específicos do veículo.',
        passos: '1. Desligue o limpador e verifique sujeira ou detritos no vidro e na borracha.\n2. Inspecione cortes, ressecamento e contato do braço; confirme o tamanho e o encaixe da palheta.\n3. Substitua a palheta danificada conforme o manual, protegendo o vidro para o braço não bater nele.\n4. Teste com o vidro molhado e confirme a limpeza sem riscos ou ruídos.',
        dificuldade: 'Fácil', ferramentas: 'Palheta compatível e pano para proteger o vidro'
      }]
    }, 96);
  }
  const motorFailure = /\bnao (?:esta |ta )?(?:funciona|funcionando|liga|ligando|aciona|acionando|mexe|movimenta|se move|se movimenta|limpa)\b|\b(?:parou de funcionar|parou de mexer|parou de vez|nao da sinal|sem movimento|sem funcionar|travou|inoperante)\b|\bmotor\b.{0,30}\b(?:queimou|queimado)\b|\blimpador(?: traseiro| do para brisa)? parou\b/.test(text)
    && !/\bnao (?:esta |ta )?(?:travado|queimado|inoperante)\b/.test(text);
  if (wiper && motorFailure && !bladeDamage) {
    const part = rear ? 'Motor do limpador traseiro' : 'Motor do limpador de para-brisa';
    add('wiper-motor', 'Motor do limpador não funciona', {
      nome: 'Motor do limpador com falha a confirmar',
      descricao: 'Quando o limpador não liga ou não se movimenta, verifique fusível, relé, comando, alimentação, aterramento e articulações. Com alimentação correta e defeito confirmado no motor do limpador, recomenda-se a troca do motor compatível com a versão.',
      purchaseParts: [part],
      repairGuides: [{ titulo: 'Diagnóstico e troca do motor do limpador',
        descricao: 'Confirmar falha do motor antes da substituição.',
        passos: '1. Desligue o acionamento e verifique se as palhetas ou articulações estão presas.\n2. Em oficina, teste fusíveis, relés, comando, conectores, alimentação e aterramento.\n3. Confirme se o motor recebe alimentação e se o defeito está nele, diferenciando falha das articulações.\n4. Substitua o motor do limpador com defeito confirmado conforme o manual e ajuste a posição de repouso.\n5. Teste velocidades, retorno à posição de repouso e lavador com o vidro molhado.',
        dificuldade: 'Mediano', ferramentas: 'Multímetro, soquetes e ferramentas indicadas pelo fabricante'
      }]
    }, 95);
  }

  const signal = /\b(pisca|seta|setas|indicador de direcao|indicadores de direcao)\b/.test(text);
  const signalFailure = /\bnao (?:esta |ta )?(?:funciona|funcionando|acende|acendendo|pisca|piscando|liga|ligando|da sinal)\b|\b(?:apagado|apagada|queimou|queimad[oa]|parou de funcionar|parou de piscar|sem funcionar|sem sinal)\b|\b(?:pisca|piscando) (?:muito )?(?:rapido|depressa|acelerad[oa])\b/.test(text)
    && !/\b(?:nao|sem) (?:esta |tem )?(?:queimad[oa]|apagad[oa]|defeito|falha)\b/.test(text);
  if (signal && signalFailure) {
    add('turn-signal', 'Pisca ou seta não funciona ou pisca rápido', {
      nome: 'Lâmpada da seta queimada ou fonte de luz com falha',
      descricao: 'Seta apagada ou piscando rápido pode indicar lâmpada queimada. Verifique soquete, alimentação e aterramento; recomenda-se trocar a lâmpada com defeito confirmado quando ela for removível. Em seta de LED integrado, confirme qual conjunto contém a seta antes da compra.',
      purchaseParts: ['Lâmpada da seta'],
      repairGuides: [{ titulo: 'Inspeção e troca da lâmpada da seta ou conjunto LED',
        descricao: 'Identificar função, lado e tecnologia instalada antes de comprar.',
        passos: '1. Identifique a seta afetada e confirme se usa lâmpada removível ou LED integrado.\n2. Verifique soquete, conectores, fusíveis, comando, alimentação e aterramento.\n3. Com defeito confirmado e lâmpada removível, substitua a lâmpada da seta pela especificada.\n4. Se a seta usa LED integrado não substituível, troque o conjunto correspondente: farol, lanterna ou repetidor lateral conforme a versão.\n5. Confira todas as setas e o pisca-alerta.',
        dificuldade: 'Fácil', ferramentas: 'Multímetro e ferramentas de acesso ao conjunto de iluminação'
      }]
    }, 94);
  }
  return results;
}

module.exports = { getWiperSignalHypotheses };
