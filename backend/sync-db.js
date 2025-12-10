const db = require('./models');

(async () => {
  try {
    console.log('🔌 A tentar autenticar na base de dados...');
    await db.sequelize.authenticate();
    console.log('🔁 Autenticação bem sucedida. A sincronizar models -> tabelas (alter: true)...');

    // Use ALTER to update tables to match models without dropping data.
    // If you want to recreate tables from scratch (danger: loses data), set force: true
    await db.sequelize.sync({ alter: true });

    console.log('✅ Sincronização concluída. As tabelas foram criadas/atualizadas.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro ao sincronizar a base de dados:');
    console.error(err && err.message ? err.message : err);
    process.exit(1);
  }
})();
