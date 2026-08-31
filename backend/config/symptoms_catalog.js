module.exports = [
  // ── MOTOR ──────────────────────────────────────────────────────────────────
  {
    nome: "Motor falhando / perda de potência",
    descricao: "O motor apresenta falhas na aceleração, engasgos e perda perceptível de rendimento.",
    codigo_obd: "P0300",
    categoria: "Motor",
    keywords: ["falha","falhando","potencia","perda","engasga","fraco","rendimento","vela","bobina","acelera","engasgando","falta de força","perde força"],
    causes: [{ nome: "Velas de ignição desgastadas ou cabos com fuga de corrente", descricao: "As velas atingiram o fim da vida útil ou os cabos estão desgastados, impedindo a centelha correta.", probabilidade: "Alta", repairGuides: [{ titulo: "Substituição das velas e cabos de ignição", descricao: "Inspecionar e trocar velas de ignição em motores Fiat.", passos: "1. Motor frio.\n2. Remova a capa do motor.\n3. Desconecte os cabos de vela pelo conector.\n4. Desrosqueie a vela com chave e extensão.\n5. Ajuste a folga dos eletrodos das velas novas.\n6. Rosqueie manualmente e aperte com a chave.\n7. Reconecte os cabos e teste.", tempo_estimado: "40 minutos", dificuldade: "Mediano", ferramentas: "Chave de vela 16/21mm, calibre de folga, catraca" }] }]
  },
  {
    nome: "Superaquecimento do motor / luz de temperatura acesa",
    descricao: "O indicador de temperatura está no vermelho ou a luz de aviso acendeu.",
    codigo_obd: "P0117",
    categoria: "Motor",
    keywords: ["quente","esquentando","ferver","temperatura","aquecimento","ferveu","valvula","termostatica","aditivo","agua","arrefecimento","superaquecendo","radiador","vapor"],
    causes: [{ nome: "Válvula termostática travada ou vazamento de líquido de arrefecimento", descricao: "A válvula travou impedindo circulação até o radiador, ou há perda do líquido.", probabilidade: "Alta", repairGuides: [{ titulo: "Troca da válvula termostática e sangria do arrefecimento", descricao: "Trocar a válvula e restabelecer o arrefecimento.", passos: "1. Pare e espere o motor esfriar.\n2. Drene a água antiga.\n3. Remova e troque a válvula termostática.\n4. Recoloque as mangueiras.\n5. Complete com 50% aditivo + 50% água desmineralizada.\n6. Sangre o ar do sistema.", tempo_estimado: "60 minutos", dificuldade: "Mediano", ferramentas: "Alicate, chaves 10/13mm, bandeja, aditivo" }] }]
  },
  {
    nome: "Ruído metálico no motor (batida de pino / tuchos)",
    descricao: "Barulho metálico de batida contínuo ou ao acelerar, vindo do interior do motor.",
    codigo_obd: null,
    categoria: "Motor",
    keywords: ["ruido","barulho","batida","batendo","metal","metalico","tucho","pino","oleo","viscosidade","lubrificacao","tique","tique-tique","pancada"],
    causes: [{ nome: "Nível de óleo baixo ou viscosidade inadequada", descricao: "Falta de óleo ou óleo muito fino impede a lubrificação dos tuchos hidráulicos.", probabilidade: "Alta", repairGuides: [{ titulo: "Verificação e completamento do óleo lubrificante", descricao: "Inspecionar o nível e completar de forma correta.", passos: "1. Superfície plana, motor frio.\n2. Puxe a vareta e limpe.\n3. Reinsira e verifique: nível deve estar entre MIN e MAX.\n4. Adicione óleo correto (ex: 5W30) aos poucos.\n5. Não ultrapasse o MAX.", tempo_estimado: "15 minutos", dificuldade: "Fácil", ferramentas: "Óleo correto, funil, pano" }] }]
  },
  {
    nome: "Luz CHECK ENGINE acesa no painel",
    descricao: "A luz de injeção (motor amarelo) acendeu e permanece acesa.",
    codigo_obd: "P0001",
    categoria: "Motor",
    keywords: ["check","engine","injecao","luz","amarela","painel","acesa","falha","sensor","lambda","sonda","catalisador","maf","map","acendeu","piscando"],
    causes: [{ nome: "Sensor com falha ou catalisador degradado", descricao: "Sensor de oxigênio, MAF ou MAP com falha gera código e acende a luz.", probabilidade: "Alta", repairGuides: [{ titulo: "Leitura e limpeza de códigos OBD-II", descricao: "Ler o código de falha e avaliar a gravidade.", passos: "1. Conecte o scanner OBD-II na porta de diagnóstico.\n2. Leia o(s) código(s) de falha armazenados.\n3. Anote e pesquise o código.\n4. Se for sensor de O2, limpe as conexões ou substitua.\n5. Apague o código e verifique se volta.", tempo_estimado: "30 minutos", dificuldade: "Mediano", ferramentas: "Scanner OBD-II, multímetro" }] }]
  },
  {
    nome: "Fumaça preta saindo pelo escapamento",
    descricao: "Saída excessiva de fumaça preta ou cinza escura pelo cano de descarga.",
    codigo_obd: "P0172",
    categoria: "Motor",
    keywords: ["fumaca","preta","escapamento","descarga","fumo","fumando","preto","cinza","rica","mistura","bicos","injetores","combustivel","gasolina","excesso"],
    causes: [{ nome: "Mistura ar/combustível rica — injetores sujos ou sensor MAF com falha", descricao: "Excesso de combustível na mistura gera combustão incompleta e fumaça preta.", probabilidade: "Alta", repairGuides: [{ titulo: "Limpeza de injetores e verificação do sensor MAF", descricao: "Limpar os injetores e inspecionar o sensor de fluxo de ar.", passos: "1. Use aditivo limpa-injetores no tanque.\n2. Após 1 tanque, verifique se melhorou.\n3. Se persistir, faça limpeza ultrassônica dos injetores.\n4. Inspecione e limpe o sensor MAF com spray específico.\n5. Leia códigos OBD e apague.", tempo_estimado: "20 minutos (aditivo) / 2h (limpeza)", dificuldade: "Mediano", ferramentas: "Aditivo limpa-injetores, scanner OBD, spray limpa-MAF" }] }]
  },
  {
    nome: "Fumaça branca ou azul pelo escapamento",
    descricao: "Fumaça branca densa ou azulada saindo pelo escapamento, especialmente ao ligar a frio.",
    codigo_obd: null,
    categoria: "Motor",
    keywords: ["fumaca","branca","azul","escapamento","oleo","agua","queimando","gaxeta","junta","cabecote","vela molhada","anticongelante","aditivo consumindo"],
    causes: [{ nome: "Queima de óleo (azul) ou junta de cabeçote comprometida (branca)", descricao: "Fumaça azul indica óleo no combustível; branca indica água/aditivo entrando na câmara.", probabilidade: "Alta", repairGuides: [{ titulo: "Diagnóstico de junta de cabeçote e anéis de segmento", descricao: "Avaliar a integridade da junta e anéis do motor.", passos: "1. Verifique o nível de aditivo: consumo rápido indica junta.\n2. Faça teste de pressão do cilindro (compressão).\n3. Inspecione as velas: vela branca/molhada indica problema.\n4. Se confirmado, encaminhe para retífica.", tempo_estimado: "1 hora (diagnóstico)", dificuldade: "Difícil", ferramentas: "Manômetro de compressão, scanner OBD" }] }]
  },
  {
    nome: "Motor engasgando em marcha lenta / rotação instável",
    descricao: "O motor oscila, soluça ou apaga sozinho quando parado no sinal ou estacionado.",
    codigo_obd: "P0505",
    categoria: "Motor",
    keywords: ["marcha lenta","rotacao","instavel","soluço","apaga","apagando","oscila","oscilando","ralenti","rpm","baixo","variando","trepidando","balancando"],
    causes: [{ nome: "Válvula IAC suja ou sensor TPS descalibrado", descricao: "A válvula de controle de ar em marcha lenta está com depósito ou o sensor de posição do acelerador está fora de calibração.", probabilidade: "Alta", repairGuides: [{ titulo: "Limpeza da válvula IAC e calibração do TPS", descricao: "Limpar a válvula de marcha lenta e verificar o sensor do acelerador.", passos: "1. Localize a válvula IAC próxima ao corpo de borboleta.\n2. Desconecte e remova a válvula.\n3. Limpe com spray limpa-carburador.\n4. Recoloque e ligue o motor.\n5. Se persistir, use scanner para verificar o TPS e recalibrar.", tempo_estimado: "45 minutos", dificuldade: "Mediano", ferramentas: "Spray limpa-carburador, scanner OBD, chaves Torx" }] }]
  },
  {
    nome: "Alto consumo de combustível",
    descricao: "O veículo está consumindo muito mais combustível do que o normal para o percurso feito.",
    codigo_obd: null,
    categoria: "Motor",
    keywords: ["consumo","combustivel","gasolina","etanol","alto","muito","litros","km por litro","gasta","gastando","economico","rendimento","tanque","enchendo"],
    causes: [{ nome: "Filtro de ar sujo, velas gastas ou pneus mal calibrados", descricao: "Filtro obstruído reduz eficiência da combustão; velas desgastadas desperdiçam combustível.", probabilidade: "Alta", repairGuides: [{ titulo: "Verificação de filtro de ar, velas e calibragem de pneus", descricao: "Inspeção dos principais causadores de consumo elevado.", passos: "1. Remova e inspecione o filtro de ar: se escuro, troque.\n2. Verifique o estado das velas de ignição.\n3. Calibre os 4 pneus conforme etiqueta da porta.\n4. Se persistir, leia códigos OBD para verificar sensores.", tempo_estimado: "30 minutos", dificuldade: "Fácil", ferramentas: "Filtro de ar novo, velas novas, calibrador de pneus" }] }]
  },
  {
    nome: "Dificuldade para dar partida / motor demora para pegar",
    descricao: "O carro demora vários segundos de motor girando antes de pegar, ou às vezes não pega.",
    codigo_obd: null,
    categoria: "Motor",
    keywords: ["partida","pegar","dificuldade","demora","nao pega","girar","arranque","bomba","combustivel","pressao","injecao","filtro","afogador"],
    causes: [{ nome: "Pressão de combustível baixa ou filtro de combustível obstruído", descricao: "A bomba ou filtro impedem pressão adequada nos injetores para partida fria.", probabilidade: "Alta", repairGuides: [{ titulo: "Troca do filtro de combustível e teste da bomba", descricao: "Substituir o filtro e verificar a pressão do sistema.", passos: "1. Localize o filtro de combustível (geralmente sob o carro ou no motor).\n2. Despressurize o sistema antes.\n3. Troque o filtro.\n4. Use manômetro para verificar pressão da bomba.\n5. Se pressão baixa, troque a bomba.", tempo_estimado: "45 minutos", dificuldade: "Mediano", ferramentas: "Filtro novo, manômetro de pressão, chaves e trapos" }] }]
  },
  {
    nome: "Vazamento de óleo pelo motor",
    descricao: "Manchas de óleo no chão onde o carro estaciona ou cheiro de óleo queimado ao dirigir.",
    codigo_obd: null,
    categoria: "Motor",
    keywords: ["vazamento","oleo","manchas","chao","escorrendo","cheiro","queimando","gaxeta","junta","tampa","valvula","retentores","carter","visor"],
    causes: [{ nome: "Juntas ou retentores de óleo desgastados", descricao: "Com o tempo, as gaxetas e retentores endurecem e perdem a vedação.", probabilidade: "Alta", repairGuides: [{ titulo: "Identificação e troca de junta/retentor de óleo", descricao: "Localizar a origem do vazamento e substituir a peça.", passos: "1. Limpe o motor com desengraxante.\n2. Marque em papel onde está o vazamento.\n3. Depois de rodar, identifique a origem exata.\n4. Troque a gaxeta ou retentor da área identificada.", tempo_estimado: "1-3 horas", dificuldade: "Mediano", ferramentas: "Desengraxante, junta/retentor novo, chaves combinadas" }] }]
  },

  // ── FREIOS ─────────────────────────────────────────────────────────────────
  {
    nome: "Barulho de atrito metálico ao frear",
    descricao: "Ruído estridente ou de raspagem metálica ao pressionar o pedal com o veículo em movimento.",
    codigo_obd: null,
    categoria: "Freios",
    keywords: ["freio","frear","barulho","chiado","chiando","raspa","raspando","metalico","pastilha","pastilhas","disco","discos","guincho","rangido","atrito"],
    causes: [{ nome: "Pastilhas de freio totalmente gastas", descricao: "O suporte metálico da pastilha está encostando no disco.", probabilidade: "Alta", repairGuides: [{ titulo: "Substituição das pastilhas de freio dianteiras", descricao: "Trocar as pastilhas gastas do eixo dianteiro.", passos: "1. Afrouxe os parafusos da roda dianteira.\n2. Eleve o carro com macaco e cavaletes.\n3. Remova a roda.\n4. Remova a pinça (pendure com arame).\n5. Retire as pastilhas gastas.\n6. Recue o pistão com sargento.\n7. Instale pastilhas novas.\n8. Remonte e bombeie o pedal.", tempo_estimado: "45 minutos", dificuldade: "Mediano", ferramentas: "Macaco, cavaletes, chave Allen 7mm, sargento de freio" }] }]
  },
  {
    nome: "Pedal de freio fofo ou baixo ao pisar",
    descricao: "O pedal cede excessivamente até próximo ao assoalho, sensação de maciez ou falta de firmeza.",
    codigo_obd: null,
    categoria: "Freios",
    keywords: ["freio","pedal","fofo","murcho","baixo","macio","afunda","afundando","ar","oleo","fluido","sangria","esponjoso","cede","mole"],
    causes: [{ nome: "Presença de ar no sistema hidráulico ou fluido vencido", descricao: "Bolhas de ar ou fluido com muita umidade comprometem a pressão.", probabilidade: "Alta", repairGuides: [{ titulo: "Sangria do sistema e troca de fluido de freio", descricao: "Remover bolhas e renovar o fluido DOT 4.", passos: "1. Complete o reservatório com fluido DOT 4 novo.\n2. Inicie pela roda mais distante (traseira direita).\n3. Bombeie o pedal e abra a válvula de sangria.\n4. Feche antes de aliviar a pressão.\n5. Repita até sair fluido limpo e sem bolhas.\n6. Faça todas as 4 rodas.", tempo_estimado: "50 minutos", dificuldade: "Mediano", ferramentas: "Fluido DOT 4, mangueira transparente, chave 8/9mm, ajudante" }] }]
  },
  {
    nome: "Luz do freio de mão / ABS acesa no painel",
    descricao: "Luz vermelha de freio ou luz amarela do ABS acesa permanentemente no painel.",
    codigo_obd: null,
    categoria: "Freios",
    keywords: ["freio","painel","luz","acesa","abs","amarela","vermelha","freio de mao","reservatorio","fluido","sensor","roda","velocidade"],
    causes: [{ nome: "Fluido de freio abaixo do nível ou sensor ABS com falha", descricao: "Sensor detecta nível crítico de fluido ou falha no sensor de velocidade da roda.", probabilidade: "Alta", repairGuides: [{ titulo: "Verificar nível do fluido de freio e sensor ABS", descricao: "Completar fluido e inspecionar o sensor ABS.", passos: "1. Abra o capô e veja o reservatório do fluido de freio.\n2. Complete com DOT 4 até o MAX se estiver abaixo do MIN.\n3. Se a luz ABS persistir, use scanner para ler o código de falha.\n4. Inspecione o sensor ABS da roda indicada pelo código.", tempo_estimado: "15 minutos", dificuldade: "Fácil", ferramentas: "Fluido DOT 4, scanner OBD-II" }] }]
  },
  {
    nome: "Pulsação ou vibração no pedal de freio",
    descricao: "O pedal vibra ou pulsa ao freiar, especialmente em frenagens mais fortes.",
    codigo_obd: null,
    categoria: "Freios",
    keywords: ["pulsacao","vibracao","pedal","trepida","trepidando","empurra","disco","empenado","ovalizado","freio","balanca","oscila"],
    causes: [{ nome: "Disco de freio empenado ou com espessura irregular", descricao: "O disco sofreu superaquecimento e deformou, causando pulsação a cada giro.", probabilidade: "Alta", repairGuides: [{ titulo: "Retífica ou substituição do disco de freio", descricao: "Avaliar e recuperar ou trocar o disco empenado.", passos: "1. Remova a roda e a pinça de freio.\n2. Remova o disco.\n3. Leve à retífica para medir espessura e aplanar.\n4. Se abaixo do limite mínimo, substitua o disco.\n5. Troque também as pastilhas ao trocar discos.", tempo_estimado: "60 minutos", dificuldade: "Mediano", ferramentas: "Macaco, cavaletes, chaves, micrômetro" }] }]
  },
  {
    nome: "Freio puxando para um lado ao frear",
    descricao: "O carro desvia para a direita ou esquerda automaticamente ao acionar o freio.",
    codigo_obd: null,
    categoria: "Freios",
    keywords: ["freio","puxa","puxando","lado","desvia","desviando","esquerda","direita","pastilha","pinca","travando","caliper","roda"],
    causes: [{ nome: "Pinça de freio travada ou pastilha com desgaste desigual", descricao: "Uma pinça presa não libera o disco completamente, gerando diferença de frenagem entre os lados.", probabilidade: "Alta", repairGuides: [{ titulo: "Limpeza e desbloqueio da pinça de freio", descricao: "Liberar o pistão da pinça e verificar o desgaste.", passos: "1. Remova a roda do lado que puxa.\n2. Remova a pinça e inspecione o pistão.\n3. Limpe o pistão com fluido de freio e retraia-o com sargento.\n4. Lubrifique os pinos guia com graxa de silicone.\n5. Remonte e teste a frenagem.", tempo_estimado: "60 minutos", dificuldade: "Mediano", ferramentas: "Macaco, cavaletes, sargento, graxa de silicone, fluido DOT 4" }] }]
  },
  {
    nome: "Freio de mão não segura o carro na rampa",
    descricao: "O freio de estacionamento não mantém o veículo parado em aclives mesmo puxado ao máximo.",
    codigo_obd: null,
    categoria: "Freios",
    keywords: ["freio de mao","freio de estacionamento","rampa","aclive","nao segura","solta","cabo","regulagem","regulado","afinado","lonas","sapatas","tambor"],
    causes: [{ nome: "Cabo do freio de mão esticado ou lonas traseiras gastas", descricao: "Com o uso, o cabo perde tensão ou as lonas ficam tão finas que não prendem o tambor.", probabilidade: "Alta", repairGuides: [{ titulo: "Regulagem do cabo do freio de mão", descricao: "Tensionar o cabo para restaurar a eficiência do freio de estacionamento.", passos: "1. Localize o tensor do cabo embaixo do carro ou no console.\n2. Gire o ajuste para tensionar o cabo.\n3. O freio deve segurar ao puxar 4-6 cliques.\n4. Se não melhorar, inspecione e troque as lonas traseiras.", tempo_estimado: "30 minutos", dificuldade: "Fácil", ferramentas: "Chave de boca, macaco" }] }]
  },
  {
    nome: "Rangido ou chiado ao frear devagar",
    descricao: "Som de rangido ou chiado fino apenas em frenagens a baixa velocidade, desaparecendo quando para.",
    codigo_obd: null,
    categoria: "Freios",
    keywords: ["rangido","chiado","frear devagar","baixa velocidade","pastilha nova","amortecimento","anti-ruido","graxa","pino","guia"],
    causes: [{ nome: "Falta de graxa anti-ruído nos pinos guia ou pastilha vibrando", descricao: "Sem lubrificação adequada nos pinos, a pastilha ressoa contra a pinça.", probabilidade: "Alta", repairGuides: [{ titulo: "Aplicação de graxa anti-ruído nos pinos guia", descricao: "Lubrificar os pinos e o dorso das pastilhas para eliminar o rangido.", passos: "1. Remova a pinça e os pinos guia.\n2. Limpe os pinos com escova de aço.\n3. Aplique graxa de cobre ou graxa cerâmica nos pinos.\n4. Aplique graxa anti-ruído no dorso das pastilhas (nunca na face de fricção).\n5. Remonte.", tempo_estimado: "40 minutos", dificuldade: "Fácil", ferramentas: "Graxa anti-ruído, escova de aço, chave Allen" }] }]
  },
  {
    nome: "Cheiro de borracha queimada ou freio quente",
    descricao: "Odor forte de material queimado proveniente das rodas após dirigir.",
    codigo_obd: null,
    categoria: "Freios",
    keywords: ["cheiro","queimando","quente","borracha","fumaça","rodas","freio","superaquecimento","pinça","travada","disco","pastilha"],
    causes: [{ nome: "Pinça de freio travada deixando pastilha em contato com disco", descricao: "Com a pinça presa, o freio fica parcialmente acionado o tempo todo, gerando calor excessivo.", probabilidade: "Alta", repairGuides: [{ titulo: "Inspeção e liberação de pinça travada", descricao: "Verificar e desbloquear a pinça de freio superaquecida.", passos: "1. Pare o carro em local seguro e aguarde esfriar.\n2. Eleve o carro e remova a roda quente.\n3. Inspecione se o disco está excessivamente quente.\n4. Tente girar o disco manualmente: resistência = pinça presa.\n5. Remova, limpe e libere o pistão ou substitua a pinça.", tempo_estimado: "60 minutos", dificuldade: "Mediano", ferramentas: "Macaco, cavaletes, sargento de freio, fluido DOT 4" }] }]
  },

  // ── SUSPENSÃO ──────────────────────────────────────────────────────────────
  {
    nome: "Barulho de batida seca ao passar por buracos",
    descricao: "Ruído surdo de impacto na suspensão dianteira ao trafegar por vias irregulares.",
    codigo_obd: null,
    categoria: "Suspensão",
    keywords: ["barulho","batida","seca","nhec","buraco","irregularidade","bieleta","estabilizadora","suspensao","amortecedor","lombada","baque","pancada"],
    causes: [{ nome: "Bieletas da barra estabilizadora desgastadas", descricao: "As articulações nas extremidades das bieletas ganharam folga.", probabilidade: "Alta", repairGuides: [{ titulo: "Substituição das bieletas estabilizadoras dianteiras", descricao: "Trocar as bieletas da suspensão dianteira.", passos: "1. Afrouxe os parafusos da roda dianteira.\n2. Eleve e apóie em cavaletes.\n3. Remova a roda.\n4. Solte as porcas da bieleta com contra-apoio Allen.\n5. Retire e instale a nova bieleta.\n6. Reinstale a roda.", tempo_estimado: "30 minutos", dificuldade: "Fácil", ferramentas: "Macaco, cavaletes, chaves 15/17mm, Allen para contra-apoio" }] }]
  },
  {
    nome: "Direção puxando para um dos lados em linha reta",
    descricao: "É necessário forçar o volante constantemente para manter trajetória reta.",
    codigo_obd: null,
    categoria: "Suspensão",
    keywords: ["direcao","puxando","lado","volante","torto","alinhamento","pressao","calibragem","pneu","convergencia","deriva","desvio","terminal","bandeja"],
    causes: [{ nome: "Pneus com pressão desigual ou desalinhamento da geometria", descricao: "Calibração incorreta ou folgas em terminais de direção alteram a convergência.", probabilidade: "Alta", repairGuides: [{ titulo: "Calibragem dos pneus e inspeção de alinhamento", descricao: "Verificar pressão antes de levar ao alinhador.", passos: "1. Calibre os 4 pneus frios conforme etiqueta da porta.\n2. Faça um teste em rua plana e reta.\n3. Se persistir, leve para alinhamento 3D.", tempo_estimado: "15 minutos", dificuldade: "Fácil", ferramentas: "Calibrador de pneus" }] }]
  },
  {
    nome: "Rangido ao esterçar o volante",
    descricao: "Rangido ao girar a direção com o carro parado ou em baixas velocidades.",
    codigo_obd: null,
    categoria: "Suspensão",
    keywords: ["ruido","rangido","estercar","girar","direcao","volante","coxim","amortecedor","copo","rolamento","cruze","virar","manobra"],
    causes: [{ nome: "Rolamento do coxim superior do amortecedor danificado", descricao: "O rolamento que permite o amortecedor girar junto com as rodas travou.", probabilidade: "Alta", repairGuides: [{ titulo: "Troca do coxim e rolamento superior do amortecedor", descricao: "Substituição do componente de apoio rotativo.", passos: "1. Eleve o carro e remova a roda.\n2. Desparafuse o amortecedor.\n3. Pelo cofre do motor, solte as porcas superiores do coxim.\n4. Retire a coluna de suspensão completa.\n5. Com encolhedor de mola, desmonte e troque o coxim/rolamento.\n6. Remonte com torques corretos.", tempo_estimado: "90 minutos", dificuldade: "Mediano", ferramentas: "Encolhedor de mola, soquetes, macaco, cavaletes" }] }]
  },
  {
    nome: "Vibração no volante em alta velocidade",
    descricao: "O volante treme ou vibra perceptivelmente acima de 80-100 km/h.",
    codigo_obd: null,
    categoria: "Suspensão",
    keywords: ["vibracao","volante","velocidade","treme","tremendo","balanceamento","balanceado","roda","pneu","alta","rodagem","peso","chumbo","aro"],
    causes: [{ nome: "Roda desbalanceada ou peso de balanceamento perdido", descricao: "A roda ficou fora de balanço causando vibração proporcional à velocidade.", probabilidade: "Alta", repairGuides: [{ titulo: "Balanceamento das rodas dianteiras", descricao: "Levar as rodas para rebalancear na borracharia.", passos: "1. Leve o carro a uma borracharia de confiança.\n2. Solicite o balanceamento eletrônico das 4 rodas.\n3. Informe em que velocidade aparece a vibração.\n4. Verifique se as calotinhas/parafusos estão firmes após.", tempo_estimado: "30 minutos", dificuldade: "Fácil", ferramentas: "Máquina de balanceamento (borracharia)" }] }]
  },
  {
    nome: "Carro oscilando / balançando muito após lombada",
    descricao: "Após passar por lombada ou ondulação, o carro continua oscilando por mais tempo que o normal.",
    codigo_obd: null,
    categoria: "Suspensão",
    keywords: ["amortecedor","oscilando","balancando","lombada","solavanco","molejo","mola","suspensao","cheio","vazio","quicando","balanca","absorvendo"],
    causes: [{ nome: "Amortecedor dianteiro ou traseiro gasto", descricao: "O amortecedor perdeu a capacidade de dissipar energia das molas.", probabilidade: "Alta", repairGuides: [{ titulo: "Teste e substituição dos amortecedores", descricao: "Avaliar os amortecedores e substituir se necessário.", passos: "1. Empurre com força cada canto do carro para baixo e solte.\n2. Se o carro der mais de 1 'salto', o amortecedor está gasto.\n3. Substitua sempre em par (ambos da frente ou ambos de trás).\n4. Após trocar, recomenda-se alinhar e balancear.", tempo_estimado: "60-90 minutos", dificuldade: "Mediano", ferramentas: "Macaco, cavaletes, soquetes, amortecedores novos" }] }]
  },
  {
    nome: "Desgaste irregular ou prematuro dos pneus",
    descricao: "Os pneus apresentam desgaste acentuado em apenas um lado do friso ou no centro.",
    codigo_obd: null,
    categoria: "Suspensão",
    keywords: ["pneu","desgaste","irregular","prematuro","careca","lado","ombro","centro","convergencia","camber","caster","alinhamento","geometria","borracha"],
    causes: [{ nome: "Geometria de suspensão fora do especificado (camber/convergência)", descricao: "Ângulos de suspensão incorretos concentram desgaste em pontos específicos do pneu.", probabilidade: "Alta", repairGuides: [{ titulo: "Alinhamento 3D e inspeção da suspensão", descricao: "Corrigir os ângulos de suspensão para distribuir o desgaste uniformemente.", passos: "1. Leve o carro para alinhamento 3D computadorizado.\n2. Informe o padrão de desgaste observado.\n3. Solicite inspeção de terminais, bandejas e buchas.\n4. Troque as peças desgastadas antes do alinhamento.", tempo_estimado: "60 minutos (oficina)", dificuldade: "Fácil", ferramentas: "Equipamento de alinhamento 3D (oficina)" }] }]
  },
  {
    nome: "Barulho de rangido nas buchas de bandeja",
    descricao: "Ruído de rangido ou estralo ao cruzar irregularidades ou durante manobras.",
    codigo_obd: null,
    categoria: "Suspensão",
    keywords: ["bucha","bandeja","rangido","estralo","rangendo","manobra","cruze","cruzar","borracha","ressecada","desgastada","suspensao","controle"],
    causes: [{ nome: "Buchas de borracha da bandeja ressecadas ou trincadas", descricao: "Com o tempo, as buchas de poliuretano ou borracha endurecem e criam folga gerando ruídos.", probabilidade: "Alta", repairGuides: [{ titulo: "Substituição das buchas da bandeja inferior", descricao: "Trocar as buchas desgastadas da bandeja de suspensão.", passos: "1. Eleve o carro e remova a roda.\n2. Inspecione visualmente as buchas da bandeja.\n3. Use prensa ou saca-bucha para remover as antigas.\n4. Instale as novas buchas com prensa.\n5. Aperte os parafusos com o carro apoiado no peso (não suspenso).\n6. Faça alinhamento após a troca.", tempo_estimado: "2-3 horas", dificuldade: "Difícil", ferramentas: "Prensa hidráulica ou saca-bucha, macaco, cavaletes" }] }]
  },
  {
    nome: "Direção pesada / difícil de girar o volante",
    descricao: "O volante exige mais força do que o normal para esterçar, especialmente ao estacionar.",
    codigo_obd: null,
    categoria: "Suspensão",
    keywords: ["direcao","pesada","dura","volante","dificil","girar","hidrodirecao","oleo","nivel","bomba","correia","eletrica","elétrica","servo"],
    causes: [{ nome: "Nível baixo de óleo de direção hidráulica ou correia da bomba frouxa", descricao: "Sem óleo suficiente, a bomba de direção não gera pressão adequada.", probabilidade: "Alta", repairGuides: [{ titulo: "Verificação do nível de óleo de direção e correia", descricao: "Completar o óleo e inspecionar a correia da bomba de direção.", passos: "1. Localize o reservatório da direção hidráulica no motor.\n2. Verifique o nível entre MIN e MAX.\n3. Complete com óleo para direção hidráulica correto.\n4. Inspecione a correia dentada da bomba: se frouxa, regule ou troque.", tempo_estimado: "15 minutos", dificuldade: "Fácil", ferramentas: "Óleo de direção hidráulica, funil" }] }]
  },

  // ── ELÉTRICA ───────────────────────────────────────────────────────────────
  {
    nome: "O motor não gira ao girar a chave (clique único)",
    descricao: "Ao dar a partida, o motor de arranque não aciona, o painel pisca e ouve-se apenas um clique.",
    codigo_obd: null,
    categoria: "Elétrica",
    keywords: ["nao liga","nao gira","estalo","clique","bateria","zinabre","oxidacao","partida","chupeta","auxiliar","alternador","descarregada","polo","borne"],
    causes: [{ nome: "Bateria descarregada ou bornes oxidados", descricao: "A bateria não tem tensão suficiente ou a oxidação impede passagem de corrente.", probabilidade: "Alta", repairGuides: [{ titulo: "Limpeza de bornes e partida auxiliar por cabo", descricao: "Eliminar o zinabre e realizar a partida auxiliar.", passos: "1. Verifique bornes: pó branco-azul = zinabre.\n2. Remova cabos (negativo primeiro) e limpe com bicarbonato + escova metálica.\n3. Reconecte (positivo primeiro).\n4. Se não funcionar, use cabo de partida auxiliar.\n5. Ligue cabo vermelho nos positivos e preto no negativo do doador + parte metálica do motor do seu carro.\n6. Após ligar, rode por 30+ minutos.", tempo_estimado: "25 minutos", dificuldade: "Fácil", ferramentas: "Cabo de chupeta, escova de aço, bicarbonato, chave 10mm" }] }]
  },
  {
    nome: "Bateria descarregando frequentemente / alternador com falha",
    descricao: "A bateria precisa ser recarregada com frequência ou o carro não parte após ficar parado.",
    codigo_obd: null,
    categoria: "Elétrica",
    keywords: ["bateria","descarregando","alternador","nao carrega","gerador","tensao","volt","12v","14v","amperagem","correia","carga","recarregar","fraca"],
    causes: [{ nome: "Alternador com falha não recarregando a bateria", descricao: "O alternador não gera tensão suficiente para manter a bateria carregada enquanto o carro roda.", probabilidade: "Alta", repairGuides: [{ titulo: "Diagnóstico do alternador com multímetro", descricao: "Medir a tensão do alternador para confirmar a falha.", passos: "1. Com o motor ligado, use multímetro nos bornes da bateria.\n2. A tensão deve estar entre 13,8V e 14,5V.\n3. Se estiver abaixo de 13V, o alternador está com falha.\n4. Inspecione a correia do alternador: se solta ou gasta, troque.\n5. Se a correia está boa, substitua o alternador.", tempo_estimado: "20 minutos (diagnóstico)", dificuldade: "Mediano", ferramentas: "Multímetro, chaves para correia" }] }]
  },
  {
    nome: "Farol ou lanterna não acende",
    descricao: "Uma ou mais lâmpadas externas não acendem ao ligar o interruptor correspondente.",
    codigo_obd: null,
    categoria: "Elétrica",
    keywords: ["farol","lanterna","lampada","queimada","foco","luz","fusivel","eletrica","caixa fusivel","led","halogena","xenon","alto","baixo","pisca"],
    causes: [{ nome: "Lâmpada queimada ou fusível partido", descricao: "O filamento da lâmpada se rompeu ou houve um pico de tensão rompendo o fusível.", probabilidade: "Alta", repairGuides: [{ titulo: "Substituição da lâmpada do farol e verificação de fusível", descricao: "Trocar lâmpada H7 ou fusível na caixa elétrica.", passos: "1. Desligue ignição e faróis.\n2. Acesse a traseira do bloco óptico no motor.\n3. Remova a borracha protetora e o conector elétrico.\n4. Solte a trava de arame e retire a lâmpada antiga.\n5. Insira a nova (não toque no vidro com os dedos).\n6. Se não acender, verifique o fusível correspondente na caixa e troque.", tempo_estimado: "15 minutos", dificuldade: "Fácil", ferramentas: "Lâmpada sobressalente, fusível de reposição, pinça de fusíveis" }] }]
  },
  {
    nome: "Vidro elétrico sobe devagar ou trava no meio",
    descricao: "O vidro da porta perde velocidade na subida, trava ou retorna automaticamente.",
    codigo_obd: null,
    categoria: "Elétrica",
    keywords: ["vidro","eletrico","sobe","lento","trava","travando","devagar","silicone","canaleta","borracha","maquina","motor","porta"],
    causes: [{ nome: "Canaletas ressecadas ou máquina de vidro sobrecarregada", descricao: "Sujeira e falta de lubrificação nas guias geram atrito excessivo.", probabilidade: "Alta", repairGuides: [{ titulo: "Limpeza e lubrificação das canaletas de borracha", descricao: "Restabelecer a subida suave dos vidros elétricos.", passos: "1. Abaixe totalmente o vidro.\n2. Limpe o interior das canaletas com pano úmido em chave de fenda.\n3. Aplique spray de silicone aerosol em toda a canaleta.\n4. Suba e desça o vidro várias vezes para espalhar.\n5. Evite WD-40 ou óleo mineral: atacam a borracha.", tempo_estimado: "10 minutos", dificuldade: "Fácil", ferramentas: "Spray de silicone, pano, chave de fenda fina" }] }]
  },
  {
    nome: "Ar-condicionado não resfria / não gela",
    descricao: "O ar-condicionado sopra ar mas não esfria o habitáculo, mesmo na potência máxima.",
    codigo_obd: null,
    categoria: "Elétrica",
    keywords: ["ar condicionado","nao gela","nao resfria","quente","gas","freon","r134","compressor","condensador","filtro","cabine","ventilacao","sopra","frio"],
    causes: [{ nome: "Gás refrigerante baixo ou compressor com falha", descricao: "Fuga de gás refrigerante ou compressor travado impede o resfriamento.", probabilidade: "Alta", repairGuides: [{ titulo: "Recarga de gás e inspeção do sistema de A/C", descricao: "Verificar gás e componentes do ar-condicionado.", passos: "1. Leve o carro a uma oficina de A/C com equipamento de recarga.\n2. Solicite a medição da pressão do gás refrigerante.\n3. Se baixo, verifique vazamentos com detector UV antes de recarregar.\n4. Se o compressor não ligar, verifique o fusível/relê e a embreagem magnética.\n5. Troque o filtro de cabine se houver mau cheiro.", tempo_estimado: "60 minutos (oficina)", dificuldade: "Mediano", ferramentas: "Equipamento de recarga de A/C (oficina especializada)" }] }]
  },
  {
    nome: "Buzina não funciona",
    descricao: "A buzina não emite som ao pressionar o botão no volante.",
    codigo_obd: null,
    categoria: "Elétrica",
    keywords: ["buzina","som","nao funciona","muda","silenciosa","volante","botao","fusivel","rele","contato","eletrica","chifre"],
    causes: [{ nome: "Fusível da buzina partido ou buzina com defeito", descricao: "O fusível queimou por sobrecarga ou a própria buzina travou e parou de funcionar.", probabilidade: "Alta", repairGuides: [{ titulo: "Verificação do fusível e teste da buzina", descricao: "Identificar e corrigir a falha na buzina.", passos: "1. Localize o fusível da buzina na caixa de fusíveis (consulte o manual).\n2. Verifique o filamento do fusível: se rompido, troque pelo mesmo amperímetro.\n3. Se o fusível estava bom, localize a buzina (geralmente atrás da grade dianteira).\n4. Teste aplicando 12V direto da bateria na buzina.\n5. Se não tocar, substitua a buzina.", tempo_estimado: "20 minutos", dificuldade: "Fácil", ferramentas: "Fusível de reposição, multímetro, fios para teste" }] }]
  },
  {
    nome: "Travas elétricas das portas não funcionam",
    descricao: "O controle remoto ou o botão interno não trava/destrava as portas eletricamente.",
    codigo_obd: null,
    categoria: "Elétrica",
    keywords: ["trava","eletrica","porta","nao trava","nao abre","controle","remoto","chave","botao","atuador","solenoide","fusivel","central"],
    causes: [{ nome: "Atuador da trava elétrica ou fusível com defeito", descricao: "O motor ou solenoide do atuador queimou ou o fusível do central de travas rompeu.", probabilidade: "Alta", repairGuides: [{ titulo: "Verificação do fusível e do atuador de trava", descricao: "Diagnosticar o sistema de trava elétrica.", passos: "1. Verifique o fusível do 'central de travas' na caixa de fusíveis.\n2. Teste com o botão em cada porta para isolar qual não funciona.\n3. Retire a maçaneta interna e acesse o atuador da porta.\n4. Teste o atuador com 12V direto.\n5. Se não mover, substitua o atuador.", tempo_estimado: "45 minutos", dificuldade: "Mediano", ferramentas: "Painel de ferramentas de interior, multímetro, fusível" }] }]
  },
  {
    nome: "Painel de instrumentos com leituras incorretas ou luz acesa",
    descricao: "Algum indicador do painel mostra valor errado, pisca constantemente ou acende sem motivo aparente.",
    codigo_obd: null,
    categoria: "Elétrica",
    keywords: ["painel","instrumentos","luz","acesa","piscando","errado","incorreto","gauge","combustivel","velocimetro","tacometro","temperatura","sensor","indicador"],
    causes: [{ nome: "Sensor com falha ou mau contato nos conectores do painel", descricao: "Sensores como de combustível, temperatura ou pressão de óleo podem falhar e enviar leitura errada.", probabilidade: "Alta", repairGuides: [{ titulo: "Leitura de códigos OBD e inspeção de sensores", descricao: "Diagnosticar a causa da luz ou leitura incorreta.", passos: "1. Use scanner OBD-II para ler os códigos de falha.\n2. Identifique o sensor indicado pelo código.\n3. Verifique a fiação e conectores do sensor.\n4. Limpe os contatos com spray limpa-contatos.\n5. Substitua o sensor se necessário.", tempo_estimado: "30 minutos", dificuldade: "Mediano", ferramentas: "Scanner OBD-II, spray limpa-contatos, multímetro" }] }]
  },
  {
    nome: "Limpador de para-brisa não funciona ou risca o vidro",
    descricao: "Os limpadores não se movem, param no meio ou deixam marcas e listras no para-brisa.",
    codigo_obd: null,
    categoria: "Elétrica",
    keywords: ["limpador","para-brisa","palheta","borracha","risca","listras","nao funciona","motor","fusivel","velocidade","chuva","visibilidade"],
    causes: [{ nome: "Palheta desgastada ou motor do limpador com falha", descricao: "A borracha da palheta ressecou e não veda; ou o motor parou de funcionar.", probabilidade: "Alta", repairGuides: [{ titulo: "Troca das palhetas do limpador", descricao: "Substituir as borrachas das palhetas do para-brisa.", passos: "1. Eleve o braço do limpador.\n2. Localize a trava de encaixe da palheta no braço.\n3. Pressione a trava e deslize a palheta antiga para baixo.\n4. Encaixe a nova palheta no gancho e trave.\n5. Se o motor não funcionar, verifique o fusível e teste o motor com 12V direto.", tempo_estimado: "10 minutos", dificuldade: "Fácil", ferramentas: "Palhetas novas compatíveis" }] }]
  },

  // ── TRANSMISSÃO ────────────────────────────────────────────────────────────
  {
    nome: "Câmbio manual duro de engatar / marcha dificil",
    descricao: "As marchas do câmbio manual exigem força excessiva ou não engatam suavemente.",
    codigo_obd: null,
    categoria: "Transmissão",
    keywords: ["cambio","marcha","dura","dificil","engatar","nao entra","travada","forcando","alavanca","embreagem","sincronizado","oleo","caixa","transmissao"],
    causes: [{ nome: "Óleo da caixa de câmbio contaminado ou embreagem desgastada", descricao: "Óleo velho perde viscosidade adequada; embreagem desgastada não desconecta corretamente o motor da caixa.", probabilidade: "Alta", repairGuides: [{ titulo: "Troca do óleo da caixa de câmbio", descricao: "Drenar e repor o óleo da transmissão manual.", passos: "1. Eleve o carro e localize o bujão de drenagem do câmbio.\n2. Posicione bandeja e remova o bujão: drene o óleo velho.\n3. Recoloque o bujão de drenagem.\n4. Localize o bujão de nível/abastecimento.\n5. Injete óleo GL-4 ou GL-5 conforme especificação até o nível correto.", tempo_estimado: "45 minutos", dificuldade: "Mediano", ferramentas: "Bandeja, óleo GL-4/GL-5, seringa de abastecimento, chaves" }] }]
  },
  {
    nome: "Embreagem patinando ou pedal de embreagem no fundo",
    descricao: "O motor acelera mas o carro não ganha velocidade proporcionalmente, ou o pedal de embreagem fica muito baixo.",
    codigo_obd: null,
    categoria: "Transmissão",
    keywords: ["embreagem","patinando","patina","pedal","fundo","baixo","disco","plato","pressao","forca","acelerador","velocidade","nao anda"],
    causes: [{ nome: "Disco de embreagem gasto ou fluido do atuador hidráulico baixo", descricao: "O disco de embreagem atingiu o limite de desgaste e não transmite torque.", probabilidade: "Alta", repairGuides: [{ titulo: "Verificação do fluido e diagnóstico da embreagem", descricao: "Confirmar desgaste e avaliar substituição do kit de embreagem.", passos: "1. Verifique o reservatório de fluido da embreagem hidráulica.\n2. Complete se estiver abaixo do nível.\n3. Se o pedal continuar sem firmeza, sangre o sistema.\n4. Se patiná continuar, o kit de embreagem (disco, platô, rolamento) precisa ser trocado na retífica.", tempo_estimado: "30 min (fluido) / 4h+ (kit)", dificuldade: "Difícil", ferramentas: "Fluido DOT 4, caixa de ferramentas, elevador (troca do kit)" }] }]
  },
  {
    nome: "Câmbio automático / CVT solavancando ou demorando para trocar marcha",
    descricao: "O câmbio automático apresenta troca brusca de marcha, solavancos ou demora excessiva para acelerar.",
    codigo_obd: null,
    categoria: "Transmissão",
    keywords: ["automatico","cvt","solavanco","chute","marcha","demora","trocando","bruscamente","transmissao","atf","oleo","escorregando","dualogic","gsr"],
    causes: [{ nome: "Óleo ATF degradado ou software da ECU desatualizado", descricao: "Óleo de transmissão automática degradado causa solavancos; parâmetros de câmbio podem precisar de adaptação.", probabilidade: "Alta", repairGuides: [{ titulo: "Troca do óleo ATF e reset de adaptação do câmbio", descricao: "Renovar o fluido e recalibrar o câmbio automático.", passos: "1. Verifique se o câmbio tem dipstick de ATF.\n2. Se acessível, verifique a cor: escuro/queimado = troca necessária.\n3. Drene e preencha com ATF correto (consulte o manual).\n4. Use scanner para fazer o reset de adaptação do câmbio.\n5. Realize teste de condução em diferentes situações.", tempo_estimado: "60 minutos", dificuldade: "Mediano", ferramentas: "ATF correto, scanner OBD com função de adaptação, bandeja" }] }]
  },
  {
    nome: "Ruído ou rangido ao engatar a marcha ré",
    descricao: "Som de rangido ou engrenagem arranhando ao colocar o câmbio em ré.",
    codigo_obd: null,
    categoria: "Transmissão",
    keywords: ["marcha re","re","re","rangendo","grindo","arranhando","barulho","engrena","engatando","embreagem","sincronizado","dificil"],
    causes: [{ nome: "Sincronizador da ré desgastado ou embreagem sem regularidade", descricao: "A marcha ré geralmente não tem sincronizador; engatar rápido demais causa rangido.", probabilidade: "Alta", repairGuides: [{ titulo: "Técnica correta de engate e verificação da embreagem", descricao: "Verificar procedimento e saúde da embreagem para reduzir o rangido.", passos: "1. Sempre pare completamente o carro antes de engatar a ré.\n2. Pressione o pedal de embreagem totalmente e aguarde 1-2 segundos.\n3. Então engate a marcha ré devagar.\n4. Se persistir, inspecione o sistema de embreagem (fluido e cabo).\n5. Se o rangido for constante, avalie o sincronizador na retífica.", tempo_estimado: "15 minutos (inspeção)", dificuldade: "Fácil", ferramentas: "Nenhuma (técnica) / scanner e ferramentas (inspeção)" }] }]
  },
  {
    nome: "Câmbio Dualogic / automatizado com falha ou luz acesa",
    descricao: "A luz de falha da transmissão acendeu, câmbio não troca marcha ou fica travado.",
    codigo_obd: null,
    categoria: "Transmissão",
    keywords: ["dualogic","automatizado","falha","luz","acesa","travado","nao troca","atuador","oleo","eletronico","gsr","cambio","semi"],
    causes: [{ nome: "Atuador hidráulico do Dualogic com falha ou nível de óleo baixo", descricao: "O sistema eletro-hidráulico do câmbio automatizado é sensível ao nível e qualidade do óleo.", probabilidade: "Alta", repairGuides: [{ titulo: "Verificação do óleo e atuador do Dualogic", descricao: "Checar nível de óleo e leitura de falha do câmbio automatizado.", passos: "1. Use scanner específico Fiat para ler os códigos de falha.\n2. Verifique o nível de óleo do câmbio conforme o manual.\n3. Se baixo, complete com óleo Selènia WR específico.\n4. Apague os códigos e realize o procedimento de adaptação.\n5. Se persistir, o atuador eletro-hidráulico precisa ser avaliado.", tempo_estimado: "30-60 minutos", dificuldade: "Difícil", ferramentas: "Scanner Fiat, óleo Selènia WR, seringa de abastecimento" }] }]
  },
  {
    nome: "Pedal de embreagem com folga excessiva ou pesado",
    descricao: "O pedal de embreagem está muito mole e com muita folga no início, ou exige muita força para acionar.",
    codigo_obd: null,
    categoria: "Transmissão",
    keywords: ["embreagem","pedal","folga","pesado","duro","mole","regulagem","cabo","hidraulico","cilindro","fluido","ajuste","curso"],
    causes: [{ nome: "Cabo de embreagem fora de ajuste ou cilindro hidráulico com desgaste", descricao: "Com o uso, o cabo ou sistema hidráulico perde a regulagem correta.", probabilidade: "Alta", repairGuides: [{ titulo: "Regulagem do cabo ou sangria do sistema hidráulico de embreagem", descricao: "Ajustar o ponto de acionamento da embreagem.", passos: "1. Para embreagem a cabo: localize o tensor no motor e ajuste até a folga ser de 1-2cm.\n2. Para embreagem hidráulica: verifique o fluido no reservatório.\n3. Se o pedal for pesado após ajuste, o cabo pode estar desgastado ou o cilindro com vazamento.", tempo_estimado: "20 minutos", dificuldade: "Fácil", ferramentas: "Chave de boca, fluido DOT 4" }] }]
  },
];
