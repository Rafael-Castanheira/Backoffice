const path = require('path');
async function main() {
  // Load models
  const db = require(path.join(__dirname, '..', 'models'));

  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync();

    // Ensure a tipouser exists (id_tipo_user = 1)
    const tipo = await db.tipouser.findOne({ where: { id_tipo_user: 1 } });
    if (!tipo) {
      console.log('Criando tipo de utilizador padrão (id_tipo_user=1)');
      await db.tipouser.create({ id_tipo_user: 1, descricao_pt: 'Admin', descricao_en: 'Admin' });
    }

    // Create or update test user
    const email = 'test@local';
    const password = '1234';

    const existing = await db.utilizadores.findOne({ where: { email } });
    if (existing) {
      console.log('Utilizador já existe — atualizando password.');
      existing.password_hash = password;
      existing.nome = existing.nome || 'Utilizador Teste';
      await existing.save();
      console.log(`Atualizado: ${email}`);
    } else {
      const maxId = await db.utilizadores.max('id_user');
      const id = (maxId || 0) + 1;
      await db.utilizadores.create({
        id_user: id,
        id_tipo_user: 1,
        nome: 'Utilizador Teste',
        email,
        password_hash: password
      });
      console.log(`Criado utilizador de teste: ${email} / ${password}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Erro ao criar utilizador de teste:', err.message || err);
    process.exit(1);
  }
}

main();
