const express = require('express');
const cors = require('cors');
const { createCorsOptions } = require('./config/cors');

const { sequelize, Vehicle, VehicleCatalog, Symptom, Cause, RepairGuide, SymptomCatalog, CauseCatalog, RepairGuideCatalog } = require('./models');
const { rankDiagnosis } = require('./services/diagnosisService');

const app = express();
app.use(cors(createCorsOptions()));
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
    const { modelo, ano, motorizacao, quilometragem, tipo_cambio } = req.body || {};
    
    if ([modelo, motorizacao, tipo_cambio].some(value => typeof value !== 'string' || !value.trim())
      || ano == null || quilometragem == null) {
      return res.status(400).json({ error: 'Todos os campos do veículo são obrigatórios.' });
    }

    if (!Number.isInteger(ano) || ano < 1 || ano > 9999
      || !Number.isInteger(quilometragem) || quilometragem < 0) {
      return res.status(400).json({ error: 'Ano deve ser um inteiro válido e quilometragem deve ser um inteiro não negativo.' });
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

app.post('/api/vehicles/:vehicleId/diagnose', async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { selectedCategory, searchTerm, description } = req.body;

    const report = [description, searchTerm].filter((value) => typeof value === 'string' && value.trim()).join(' ');
    if (!report) {
      return res.status(400).json({ error: 'Descreva ou pesquise pelo menos um sintoma.' });
    }

    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado.' });
    }

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

    const ranked = rankDiagnosis({
      catalog: symptomsCatalog,
      query: report,
      selectedCategory,
      vehicle: vehicle.toJSON(),
      limit: 5
    });

    if (ranked.length === 0) return res.status(200).json([]);

    const results = await sequelize.transaction(async (transaction) => {
      const savedSymptomsByCatalogId = new Map();
      const results = [];
      for (const candidate of ranked) {
        let symptomRecord = savedSymptomsByCatalogId.get(candidate.symptom.id);
        if (!symptomRecord) {
          symptomRecord = await Symptom.create({
            nome: candidate.symptom.nome,
            descricao: candidate.symptom.descricao,
            codigo_obd: /^[PCBU][0-9A-F]{4}$/i.test(candidate.symptom.codigo_obd || '')
              ? candidate.symptom.codigo_obd
              : null,
            status: 'Pendente',
            vehicleId: parseInt(vehicleId, 10)
          }, { transaction });
          savedSymptomsByCatalogId.set(candidate.symptom.id, symptomRecord);
        }

        const causeRecord = await Cause.create({
          nome: candidate.causeName,
          descricao: candidate.causeDescription,
          probabilidade: null,
          symptomId: symptomRecord.id
        }, { transaction });

        const savedGuides = [];
        for (const catGuide of candidate.cause.repairGuides || []) {
          const guideRecord = await RepairGuide.create({
            titulo: catGuide.titulo,
            descricao: catGuide.descricao,
            passos: catGuide.passos,
            tempo_estimado: catGuide.tempo_estimado,
            dificuldade: catGuide.dificuldade,
            ferramentas: catGuide.ferramentas,
            causeId: causeRecord.id
          }, { transaction });
          savedGuides.push(guideRecord.toJSON());
        }

        results.push({
          ...symptomRecord.toJSON(),
          hypothesisId: causeRecord.id,
          causes: [{ ...causeRecord.toJSON(), repairGuides: savedGuides }],
          match: {
            confidence: candidate.confidence,
            evidence: candidate.evidence,
            vehicleFit: candidate.vehicleFit,
            categoryMismatch: candidate.categoryMismatch,
            category: candidate.category,
            componentToCheck: candidate.isComponentList,
            purchaseRecommended: candidate.purchaseRecommended,
            purchaseParts: candidate.purchaseParts,
            lightingNotice: candidate.lightingNotice
          }
        });
      }
      return results;
    });

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = app;

