const db = require('../models');

function parseDateArg(argv) {
  // Usage: node dev-scripts/backfill-user-created-date.js --date=YYYY-MM-DD
  const arg = argv.find((a) => a.startsWith('--date='));
  if (!arg) return null;
  const value = arg.slice('--date='.length);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('Formato inválido para --date. Usa YYYY-MM-DD.');
  }
  return value;
}

async function run() {
  const dateOverride = parseDateArg(process.argv.slice(2));

  await db.sequelize.authenticate();

  // Ensure column exists (in case script is run before server start())
  const qi = db.sequelize.getQueryInterface();
  const cols = await qi.describeTable('utilizadores');
  if (!cols.data_criacao) {
    await qi.addColumn('utilizadores', 'data_criacao', {
      type: db.Sequelize.DATEONLY,
      allowNull: true,
    });
  }

  const where = { data_criacao: null };
  const data_criacao = dateOverride || new Date();

  const [updatedCount] = await db.utilizadores.update(
    { data_criacao },
    { where }
  );

  console.log(`✅ Backfill concluído. Registos atualizados: ${updatedCount}`);
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Erro no backfill:', err?.message || err);
    process.exit(1);
  });
