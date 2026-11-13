process.env.NODE_ENV = 'test';
const { sequelize, VehicleCatalog, SymptomCatalog } = require('../models');
const app = require('../app');
const seed = require('../config/seed');
let server;
(async () => {
  if (sequelize.getDialect() !== 'sqlite') throw new Error('Banco isolado obrigatório.');
  await sequelize.sync({ force: true });
  await seed();
  server = app.listen(0, '127.0.0.1', async () => {
    console.log(JSON.stringify({ ready: true, port: server.address().port,
      vehicles: await VehicleCatalog.count(), symptoms: await SymptomCatalog.count() }));
  });
})().catch(error => { console.error(error.message); process.exitCode = 1; });
process.on('SIGTERM', async () => {
  if (server) server.close();
  await sequelize.close();
  process.exit(0);
});
