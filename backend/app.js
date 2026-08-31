const express = require('express');
const cors = require('cors');

const { Vehicle, VehicleCatalog, Symptom, Cause, RepairGuide, SymptomCatalog, CauseCatalog, RepairGuideCatalog } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/vehicles/options', async (req, res) => {
  try {
    const options = await VehicleCatalog.findAll({
      attributes: ['modelo', 'ano', 'motorizacao', 'tipo_cambio'],
      group: ['modelo', 'ano', 'motorizacao', 'tipo_cambio'],
      order: [['modelo', 'ASC'], ['ano', 'DESC']]
    });
    return res.status(200).json(options);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/vehicles', async (req, res) => {
  try {
    const { modelo, ano, motorizacao, quilometragem, tipo_cambio } = req.body;
    
    if (!modelo || !ano || !motorizacao || !quilometragem || !tipo_cambio) {
      return res.status(400).json({ error: 'Todos os campos do veículo são obrigatórios.' });
    }

    const vehicle = await Vehicle.create({
      modelo,
      ano,
      motorizacao,
      quilometragem,
      tipo_cambio
    });

    return res.status(201).json(vehicle);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Rota para retornar o catálogo completo de sintomas (usado para autocompletar no frontend)
app.get('/api/symptoms/catalog', async (req, res) => {
  try {
    const symptomsCatalog = await SymptomCatalog.findAll({
      attributes: ['nome', 'descricao', 'categoria']
    });
    return res.status(200).json(symptomsCatalog);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Rota de diagnóstico para interpretar o relato do usuário
app.post('/api/vehicles/:vehicleId/diagnose', async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { selectedCategory, searchTerm, description } = req.body;

    if (!selectedCategory) {
      return res.status(400).json({ error: 'A categoria do sintoma é obrigatória.' });
    }

    // 1. Validar se o veículo existe no banco de dados
    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado.' });
    }

    // 2. Carregar o catálogo de referência do banco de dados
    const symptomsCatalogRaw = await SymptomCatalog.findAll({
      include: [
        {
          model: CauseCatalog,
          as: 'causes',
          include: [
            {
              model: RepairGuideCatalog,
              as: 'repairGuides'
            }
          ]
        }
      ]
    });
    
    const symptomsCatalog = symptomsCatalogRaw.map(s => s.get({ plain: true }));

    // Função de normalização simples para busca textual insensível a acentos e maiúsculas
    // Função de normalização com remoção de pontuação para divisão de palavras
    const normalizeText = (text) => {
      if (!text) return '';
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove acentos
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, ' ') // substitui pontuações por espaço
        .replace(/\s+/g, ' ') // remove espaços duplicados
        .trim();
    };

    const rawInput = (description || '') + ' ' + (searchTerm || '');
    const userInput = normalizeText(rawInput);
    const userWords = userInput.split(' ');

    // 3. Filtrar os sintomas do catálogo pela categoria selecionada
    const categorySymptoms = symptomsCatalog.filter(
      (symptom) => symptom.categoria.toLowerCase() === selectedCategory.toLowerCase()
    );

    // 4. Executar algoritmo de interpretação textual por pontuação de palavras-chave
    const scoredSymptoms = categorySymptoms.map((symptom) => {
      let score = 0;
      symptom.keywords.forEach((keyword) => {
        const normalizedKeyword = normalizeText(keyword);
        
        if (normalizedKeyword.includes(' ')) {
          // Se for uma frase-chave (múltiplas palavras), verifica a presença direta na string
          if (userInput.includes(normalizedKeyword)) {
            score += 2; // Maior peso para correspondência de frase exata
          }
        } else {
          // Se for uma palavra-chave individual, faz a correspondência exata de palavra inteira
          if (userWords.includes(normalizedKeyword)) {
            score += 1;
          }
        }
      });
      return { symptom, score };
    });

    // Ordenar de forma decrescente pela pontuação
    scoredSymptoms.sort((a, b) => b.score - a.score);

    // Selecionar sintomas que tiveram pelo menos uma palavra-chave combinada
    let matchedSymptoms = scoredSymptoms
      .filter((item) => item.score > 0)
      .map((item) => item.symptom);

    // Fallback: Se nenhum termo coincidiu, apresentar todas as opções da categoria
    if (matchedSymptoms.length === 0) {
      matchedSymptoms = categorySymptoms;
    }


    // 5. Salvar a árvore de diagnóstico (Symptom -> Cause -> RepairGuide) no banco de dados vinculada ao veículo
    const savedSymptoms = [];
    for (const catSymptom of matchedSymptoms) {
      const symptomRecord = await Symptom.create({
        nome: catSymptom.nome,
        descricao: catSymptom.descricao,
        codigo_obd: catSymptom.codigo_obd,
        status: 'Pendente',
        vehicleId: parseInt(vehicleId, 10)
      });

      const savedCauses = [];
      for (const catCause of catSymptom.causes) {
        const causeRecord = await Cause.create({
          nome: catCause.nome,
          descricao: catCause.descricao,
          probabilidade: catCause.probabilidade,
          symptomId: symptomRecord.id
        });

        const savedGuides = [];
        for (const catGuide of catCause.repairGuides) {
          const guideRecord = await RepairGuide.create({
            titulo: catGuide.titulo,
            descricao: catGuide.descricao,
            passos: catGuide.passos,
            tempo_estimado: catGuide.tempo_estimado,
            dificuldade: catGuide.dificuldade,
            ferramentas: catGuide.ferramentas,
            causeId: causeRecord.id
          });
          savedGuides.push(guideRecord.toJSON());
        }

        const causeJson = causeRecord.toJSON();
        causeJson.repairGuides = savedGuides;
        savedCauses.push(causeJson);
      }

      const symptomJson = symptomRecord.toJSON();
      symptomJson.causes = savedCauses;
      savedSymptoms.push(symptomJson);
    }

    return res.status(200).json(savedSymptoms);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = app;

