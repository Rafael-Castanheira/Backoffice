const express = require('express');
const cors = require('cors');
const db = require('./models');
const Sequelize = db.Sequelize;

const app = express();
const PORT = process.env.PORT || 3001;
const DB_RETRY_DELAY_MS = Number(process.env.DB_RETRY_DELAY_MS || 2000);

// Middlewares
app.use(cors());
app.use(express.json());

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

// Serve Swagger UI and raw JSON spec
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

// Mount routes
app.use('/consulta', require('./routes/consulta_route'));
app.use('/medico', require('./routes/medico_route'));
app.use('/paciente', require('./routes/paciente_route'));
app.use('/statusconsulta', require('./routes/statusconsulta_route'));
app.use('/notificacao', require('./routes/notificacao_route'));
app.use('/horariomedico', require('./routes/horariomedico_route'));
app.use('/historicomedico', require('./routes/historicomedico_route'));
app.use('/historicodentario', require('./routes/historicodentario_route'));
app.use('/habitosestilovida', require('./routes/habitosestilovida_route'));
app.use('/tipo_notificacao', require('./routes/tipo_notificacao_route'));
app.use('/genero', require('./routes/genero_route'));
app.use('/estadocivil', require('./routes/estadocivil_route'));
app.use('/tipoparentesco', require('./routes/tipoparentesco_route'));
app.use('/tipotratamento', require('./routes/tipotratamento_route'));
app.use('/tipouser', require('./routes/tipouser_route'));
app.use('/tratamentorealizado', require('./routes/tratamentorealizado_route'));
app.use('/utilizadores', require('./routes/utilizadores_route'));
app.use('/med_spec', require('./routes/med_spec_route'));
app.use('/auth', require('./routes/auth_route'));

// Rota de Teste
app.get('/', (req, res) => {
  res.json({ message: 'O servidor Express está a funcionar!' });
});

// --- Iniciar o Servidor e a Base de Dados ---

/**
 * Creates a default Admin user type and a default Admin user if they don't exist.
 * This ensures that on first startup, the application has an administrator.
 */
async function createAdminUserIfNotFound() {
  try {
    // 1. Ensure 'Admin' user type exists
    const [adminUserType, wasUserTypeCreated] = await db.tipouser.findOrCreate({
      where: { id_tipo_user: 1 },
      defaults: {
        id_tipo_user: 1,
        descricao_pt: 'Admin',
        descricao_en: 'Admin',
      },
    });

    if (wasUserTypeCreated) {
      console.log("-> Tipo de utilizador 'Admin' (ID 1) criado.");
    }
    
    // 2. Ensure admin user exists using a fixed ID to prevent crashes
    const [adminUser, wasAdminCreated] = await db.utilizadores.findOrCreate({
      where: { email: 'admin@local' },
      defaults: {
        id_user: 9999, // Using a high, fixed ID is safer than MAX() during startup
        nome: 'Admin User',
        email: 'admin@local',
        password_hash: 'adminpass', // Password shortened to fit schema (STRING(12))
        id_tipo_user: adminUserType.id_tipo_user,
        data_criacao: new Date(),
      },
    });

    if (wasAdminCreated) {
        console.log("-> Utilizador 'admin@local' (ID 9999) criado com sucesso.");
    }

  } catch (error) {
    console.error('❌ Erro ao criar utilizador admin default:', error);
  }
}

/**
 * Seeds reference tables with minimal defaults when empty.
 * This prevents empty dropdowns in the frontend on fresh databases.
 */
async function seedGeneroIfEmpty() {
  try {
    if (!db.genero) return;
    const count = await db.genero.count();
    if (count > 0) return;

    await db.genero.bulkCreate(
      [
        { id_genero: 1, descricao_pt: 'Masculino', descricao_en: 'Male' },
        { id_genero: 2, descricao_pt: 'Feminino', descricao_en: 'Female' },
      ],
      { validate: true }
    );
    console.log("-> Tabela 'genero' estava vazia — seed Masculino/Feminino criado.");
  } catch (error) {
    console.error("⚠️ Falha ao fazer seed de 'genero' (continuando):", error.message || error);
  }
}

// Usamos db.sequelize.sync() para garantir que a BD está ligada
// antes de o servidor começar a aceitar pedidos.
async function start() {
  try {
    // Wait for DB to be available before accepting requests.
    // This avoids intermittent 500s (e.g. /paciente) while the DB is still booting.
    while (true) {
      try {
        await db.sequelize.authenticate();
        break;
      } catch (e) {
        console.error('❌ Base de dados indisponível. A tentar novamente em breve...', e.message || e);
        await new Promise((r) => setTimeout(r, DB_RETRY_DELAY_MS));
      }
    }

    // Treat unset NODE_ENV as development for local convenience.
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      try {
        const { execSync } = require('child_process');
        console.log('🔧 Ambiente de desenvolvimento detectado — executando script de criação de tabelas (dev-scripts/create-tables-and-fks.js)');
        execSync('node dev-scripts/create-tables-and-fks.js', { stdio: 'inherit' });
      } catch (e) {
        console.error('⚠️ Falha ao executar script de criação de tabelas (continuando):', e.message || e);
      }
    }

    await db.sequelize.sync();
    console.log('✅ Base de dados ligada com sucesso.');

    // Ensure schema has required columns (safe in dev / existing DBs)
    try {
      const qi = db.sequelize.getQueryInterface();
      const cols = await qi.describeTable('utilizadores');
      if (!cols.data_criacao) {
        await qi.addColumn('utilizadores', 'data_criacao', {
          type: Sequelize.DATEONLY,
          allowNull: true,
        });
        console.log('🔧 Coluna utilizadores.data_criacao adicionada.');
      }

      const hdCols = await qi.describeTable('historicodentario');
      if (!hdCols.historico_tratamentos) {
        await qi.addColumn('historicodentario', 'historico_tratamentos', {
          type: Sequelize.TEXT,
          allowNull: true,
        });
        console.log('🔧 Coluna historicodentario.historico_tratamentos adicionada.');
      }
    } catch (e) {
      console.error('⚠️ Falha ao garantir colunas (continuando):', e.message || e);
    }

    await createAdminUserIfNotFound();
    await seedGeneroIfEmpty();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend a correr em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Erro ao inicializar servidor:', err.stack || err.message || err);
    process.exitCode = 1;
  }
}

start();