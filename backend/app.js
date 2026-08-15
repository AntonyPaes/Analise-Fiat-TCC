const express = require('express');
const cors = require('cors');

const { Vehicle, VehicleCatalog, Symptom, Cause, RepairGuide } = require('./models');

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

module.exports = app;
