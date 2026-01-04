const db = require('../models');
const { Op } = db.Sequelize;

function titleCaseWords(s) {
  return String(s)
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function deriveNameFromEmail(email) {
  if (!email || typeof email !== 'string') return null;
  const local = email.split('@')[0];
  if (!local) return null;
  const cleaned = local
    .replace(/[._-]+/g, ' ')
    .replace(/\d+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return null;
  return titleCaseWords(cleaned);
}

function parseArgs(argv) {
  const args = {
    apply: false,
    fillMissingWith: 'skip', // 'skip' | 'utente'
  };

  for (const a of argv) {
    if (a === '--apply') args.apply = true;
    if (a.startsWith('--fill-missing-with=')) {
      args.fillMissingWith = a.split('=')[1];
    }
  }

  if (!['skip', 'utente'].includes(args.fillMissingWith)) {
    throw new Error('Valor inválido para --fill-missing-with. Usa skip|utente.');
  }

  return args;
}

async function run() {
  const { apply, fillMissingWith } = parseArgs(process.argv.slice(2));

  await db.sequelize.authenticate();

  const users = await db.utilizadores.findAll({
    where: {
      [Op.or]: [
        { nome: null },
        { nome: '' },
      ],
      // só faz sentido para pacientes (tem numero_utente)
      numero_utente: { [Op.ne]: null },
    },
    order: [['id_user', 'ASC']],
  });

  const planned = [];

  for (const u of users) {
    const derived = deriveNameFromEmail(u.email);
    let nextName = derived;

    if (!nextName && fillMissingWith === 'utente') {
      const utente = u.numero_utente ? String(u.numero_utente) : '';
      nextName = utente ? `Paciente ${utente}` : null;
    }

    if (nextName) {
      planned.push({ id_user: u.id_user, email: u.email, numero_utente: u.numero_utente, nome: nextName });
    }
  }

  console.log(`Encontrados ${users.length} utilizadores (pacientes) sem nome.`);
  console.log(`Sugestões de preenchimento: ${planned.length}.`);
  console.log('Exemplos (até 10):');
  planned.slice(0, 10).forEach((p) => {
    console.log(`- id_user=${p.id_user} utente=${p.numero_utente} email=${p.email || '-'} => nome="${p.nome}"`);
  });

  if (!apply) {
    console.log('\nDry-run: nenhuma alteração foi aplicada.');
    console.log('Para aplicar: npm run backfill-user-names -- --apply');
    console.log('Para forçar placeholder quando não há email: npm run backfill-user-names -- --apply --fill-missing-with=utente');
    return;
  }

  let updated = 0;
  for (const p of planned) {
    const [count] = await db.utilizadores.update(
      { nome: p.nome },
      { where: { id_user: p.id_user } }
    );
    updated += count;
  }

  console.log(`\n✅ Backfill de nomes concluído. Registos atualizados: ${updated}`);
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Erro no backfill de nomes:', err?.message || err);
    process.exit(1);
  });
