const db = require('./models');

(async () => {
  try {
    console.log('🔌 A tentar autenticar na base de dados...');
    await db.sequelize.authenticate();
    console.log('🔁 Autenticação bem sucedida. A sincronizar models -> tabelas (alter: true)...');

    // Temporarily disable FK checks during sync (Postgres session trick) to avoid circular FK creation order issues.
    // Note: this is a development convenience. For production, use proper migrations to add FKs after tables exist.
    await db.sequelize.query('BEGIN');
    await db.sequelize.query("SET session_replication_role = 'replica';");

    await db.sequelize.sync({ alter: true, logging: console.log });

    await db.sequelize.query("SET session_replication_role = 'origin';");
    await db.sequelize.query('COMMIT');

    console.log('✅ Sincronização concluída. As tabelas foram criadas/atualizadas.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro ao sincronizar a base de dados:');
    console.error(err && err.message ? err.message : err);
    process.exit(1);
  }
})();
