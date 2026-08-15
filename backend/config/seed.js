const VehicleCatalog = require('../models/VehicleCatalog');

const fiatBaseModels = [
  { modelo: 'Palio', anos: [2008, 2017], motorizacoes: ['1.0 Fire', '1.4 Fire', '1.6 E.torQ', '1.8 Powertrain'], cambios: ['Manual', 'Automatizado (Dualogic)'] },
  { modelo: 'Uno', anos: [2008, 2021], motorizacoes: ['1.0 Fire', '1.4 Fire', '1.0 Firefly', '1.3 Firefly'], cambios: ['Manual', 'Automatizado (Dualogic)'] },
  { modelo: 'Siena', anos: [2008, 2016], motorizacoes: ['1.0 Fire', '1.4 Fire', '1.6 E.torQ', '1.8 Powertrain'], cambios: ['Manual', 'Automatizado (Dualogic)'] },
  { modelo: 'Grand Siena', anos: [2012, 2021], motorizacoes: ['1.0 Fire', '1.4 Fire', '1.6 E.torQ'], cambios: ['Manual', 'Automatizado (Dualogic)'] },
  { modelo: 'Strada', anos: [2008, 2026], motorizacoes: ['1.3 Firefly', '1.4 Fire', '1.6 E.torQ', '1.8 Powertrain', '1.0 Turbo T200'], cambios: ['Manual', 'Automático CVT', 'Automatizado (Dualogic)'] },
  { modelo: 'Fiorino', anos: [2008, 2026], motorizacoes: ['1.3 Fire', '1.4 EVO'], cambios: ['Manual'] },
  { modelo: 'Punto', anos: [2008, 2017], motorizacoes: ['1.4 Fire', '1.6 E.torQ', '1.8 E.torQ', '1.4 T-Jet'], cambios: ['Manual', 'Automatizado (Dualogic)'] },
  { modelo: 'Linea', anos: [2009, 2016], motorizacoes: ['1.9 16v', '1.8 E.torQ', '1.4 T-Jet'], cambios: ['Manual', 'Automatizado (Dualogic)'] },
  { modelo: 'Stilo', anos: [2008, 2011], motorizacoes: ['1.8 8v', '1.8 16v', '2.4 20v'], cambios: ['Manual', 'Automatizado (Dualogic)'] },
  { modelo: 'Bravo', anos: [2011, 2016], motorizacoes: ['1.8 E.torQ', '1.4 T-Jet'], cambios: ['Manual', 'Automatizado (Dualogic)'] },
  { modelo: 'Idea', anos: [2008, 2016], motorizacoes: ['1.4 Fire', '1.6 E.torQ', '1.8 E.torQ', '1.8 Powertrain'], cambios: ['Manual', 'Automatizado (Dualogic)'] },
  { modelo: 'Doblo', anos: [2008, 2021], motorizacoes: ['1.4 Fire', '1.8 Powertrain', '1.8 E.torQ'], cambios: ['Manual'] },
  { modelo: '500', anos: [2009, 2017], motorizacoes: ['1.4 EVO', '1.4 16v', '1.4 MultiAir'], cambios: ['Manual', 'Automático', 'Automatizado (Dualogic)'] },
  { modelo: '500e', anos: [2021, 2026], motorizacoes: ['Elétrico (EV)'], cambios: ['Automático'] },
  { modelo: 'Freemont', anos: [2011, 2016], motorizacoes: ['2.4 16v'], cambios: ['Automático'] },
  { modelo: 'Toro', anos: [2016, 2026], motorizacoes: ['1.8 E.torQ', '2.4 Tigershark', '1.3 Turbo T270', '2.0 Turbodiesel', '2.2 Turbodiesel'], cambios: ['Manual', 'Automático 6 Marchas', 'Automático 9 Marchas'] },
  { modelo: 'Mobi', anos: [2016, 2026], motorizacoes: ['1.0 Fire', '1.0 Firefly'], cambios: ['Manual', 'Automatizado (Dualogic/GSR)'] },
  { modelo: 'Argo', anos: [2017, 2026], motorizacoes: ['1.0 Firefly', '1.3 Firefly', '1.8 E.torQ'], cambios: ['Manual', 'Automático 6 Marchas', 'Automático CVT', 'Automatizado (GSR)'] },
  { modelo: 'Cronos', anos: [2018, 2026], motorizacoes: ['1.0 Firefly', '1.3 Firefly', '1.8 E.torQ'], cambios: ['Manual', 'Automático 6 Marchas', 'Automático CVT', 'Automatizado (GSR)'] },
  { modelo: 'Pulse', anos: [2021, 2026], motorizacoes: ['1.3 Firefly', '1.0 Turbo T200', '1.3 Turbo T270 (Abarth)'], cambios: ['Manual', 'Automático CVT', 'Automático 6 Marchas'] },
  { modelo: 'Fastback', anos: [2022, 2026], motorizacoes: ['1.0 Turbo T200', '1.3 Turbo T270'], cambios: ['Automático CVT', 'Automático 6 Marchas'] },
  { modelo: 'Titano', anos: [2024, 2026], motorizacoes: ['2.2 Turbodiesel'], cambios: ['Manual', 'Automático 6 Marchas'] },
  { modelo: 'Ducato', anos: [2008, 2026], motorizacoes: ['2.3 Turbodiesel', '2.2 Turbodiesel'], cambios: ['Manual'] }
];

async function seedDatabase() {
  try {
    const count = await VehicleCatalog.count();
    if (count === 0) {
      console.log('🌱 Gerando combinações de veículos FIAT de 2008 até 2026 para o catálogo...');

      let generatedVehicles = [];
      for (const base of fiatBaseModels) {
        const { modelo, anos, motorizacoes, cambios } = base;
        for (let ano = anos[0]; ano <= anos[1]; ano++) {
          if (ano > 2026) break;

          for (const motor of motorizacoes) {
            for (const cambio of cambios) {
              generatedVehicles.push({
                modelo: modelo,
                ano: ano,
                motorizacao: motor,
                tipo_cambio: cambio
              });
            }
          }
        }
      }

      console.log(`🚀 Inserindo ${generatedVehicles.length} versões no catálogo de veículos FIAT...`);
      await VehicleCatalog.bulkCreate(generatedVehicles);
      console.log('✅ Catálogo de veículos FIAT inserido com sucesso!');
    } else {
      console.log('ℹ️ O catálogo já possui veículos cadastrados. Pulando inserção inicial.');
    }
  } catch (error) {
    console.error('❌ Erro ao popular o catálogo de veículos:', error);
  }
}

module.exports = seedDatabase;
