const app = require('./app');
const sequelize = require('./config/database');
const seedDatabase = require('./config/seed');
const PORT = process.env.PORT || 3000;

sequelize.sync({ force: false }).then(async () => {
  console.log('Database connected & synced');
  
  await seedDatabase();
  app.listen(PORT, () => {
    console.log(`Servidor BACKEND rodando em: http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to sync db:', err);
});
