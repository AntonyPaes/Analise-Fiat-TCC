/**
 * Script de reset: trunca a tabela vehicle_catalogs e re-executa o seed.
 * Uso: node config/reset_vehicle_catalog.js
 */
const sequelize = require('./database');
const VehicleCatalog = require('../models/VehicleCatalog');
const seedDatabase = require('./seed');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco estabelecida.');

    console.log('🗑️  Truncando tabela vehicle_catalogs...');
    await VehicleCatalog.destroy({ where: {}, truncate: true });
    console.log('✅ Tabela vehicle_catalogs limpa com sucesso!');

    console.log('🌱 Executando seed com dados atualizados...');
    await seedDatabase();

    console.log('🎉 Reset e seed concluídos com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante o reset:', error);
    process.exit(1);
  }
})();
