const path = require('path');

// Load environment variables from backend/.env for local development.
// In production, set env vars in the runtime instead of using a .env file.
try {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
} catch (e) {
  // ignore
}

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
        // Default password is 'adminpass'. Stored as bcrypt if schema supports it.
        password_hash: (() => {
          try {
            const bcrypt = require('bcryptjs');
            return bcrypt.hashSync('adminpass', 10);
          } catch {
            return 'adminpass';
          }
        })(),
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

async function seedEstadoCivilIfEmpty() {
  try {
    if (!db.estadocivil) return;
    const count = await db.estadocivil.count();
    if (count > 0) return;

    await db.estadocivil.bulkCreate(
      [
        { id_estado_civil: 1, descricao_pt: 'Solteiro', descricao_en: 'Single' },
        { id_estado_civil: 2, descricao_pt: 'Casado', descricao_en: 'Married' },
        { id_estado_civil: 3, descricao_pt: 'Divorciado', descricao_en: 'Divorced' },
        { id_estado_civil: 4, descricao_pt: 'Viúvo', descricao_en: 'Widowed' },
        { id_estado_civil: 5, descricao_pt: 'Separado', descricao_en: 'Separated' },
        { id_estado_civil: 6, descricao_pt: 'União de facto', descricao_en: 'Civil union' },
      ],
      { validate: true }
    );
    console.log("-> Tabela 'estadocivil' estava vazia — seed criado.");
  } catch (error) {
    console.error("⚠️ Falha ao fazer seed de 'estadocivil' (continuando):", error.message || error);
  }
}

async function seedStatusConsultaIfMissing() {
  try {
    if (!db.statusconsulta) return;

    // IDs fixos para manter simples no frontend e consistência no projeto.
    await db.statusconsulta.findOrCreate({
      where: { id_status_consulta: 1 },
      defaults: { id_status_consulta: 1, descricao_pt: 'Pendente', descricao_en: 'Pending' },
    });

    await db.statusconsulta.findOrCreate({
      where: { id_status_consulta: 2 },
      defaults: { id_status_consulta: 2, descricao_pt: 'Confirmado', descricao_en: 'Confirmed' },
    });
  } catch (error) {
    console.error("⚠️ Falha ao fazer seed de 'statusconsulta' (continuando):", error.message || error);
  }
}

async function seedMedicosIfMissing() {
  try {
    if (!db.medico || !db.utilizadores || !db.tipouser) return;

    const [tipoMedico] = await db.tipouser.findOrCreate({
      where: { descricao_pt: 'Médico' },
      defaults: { id_tipo_user: 3, descricao_pt: 'Médico', descricao_en: 'Doctor' },
    });
    const medicoTipoId = tipoMedico.id_tipo_user || 3;

    const seeds = [
      { id_medico: 1, id_user: 9001, nome: 'Dra. Sílvia Coimbra' },
      { id_medico: 2, id_user: 9002, nome: 'Dr. Diogo Calçada' },
      { id_medico: 3, id_user: 9003, nome: 'Dra. Melissa Sousa' },
    ];

    for (const s of seeds) {
      // Ensure user
      let user = await db.utilizadores.findByPk(s.id_user);
      if (!user) {
        user = await db.utilizadores.create({
          id_user: s.id_user,
          id_tipo_user: medicoTipoId,
          nome: s.nome,
          email: null,
          password_hash: null,
          data_criacao: new Date(),
          numero_utente: null,
          // NOTE: don't set id_medico yet (FK may exist). We'll set it after medico exists.
          id_medico: null,
        });
      } else {
        const updates = {};
        if (!user.id_tipo_user) updates.id_tipo_user = medicoTipoId;
        if (!user.nome) updates.nome = s.nome;
        if (!user.data_criacao) updates.data_criacao = new Date();
        if (Object.keys(updates).length) await user.update(updates);
      }

      // Ensure medico
      let med = await db.medico.findByPk(s.id_medico);
      if (!med) {
        med = await db.medico.create({ id_medico: s.id_medico, id_user: s.id_user });
      } else if (!med.id_user) {
        await med.update({ id_user: s.id_user });
      }

      // Link utilizador -> medico if missing
      if (user && !user.id_medico) {
        try {
          await user.update({ id_medico: s.id_medico });
        } catch (e) {
          // If FK doesn't exist or another issue happens, don't block startup.
          console.error('⚠️ Falha ao ligar utilizador ao médico (continuando):', e.message || e);
        }
      }
    }
  } catch (error) {
    console.error("⚠️ Falha ao fazer seed de 'medico' (continuando):", error.message || error);
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
        const scriptPath = path.join(__dirname, 'dev-scripts', 'create-tables-and-fks.js');
        console.log('🔧 Ambiente de desenvolvimento detectado — executando script de criação de tabelas (dev-scripts/create-tables-and-fks.js)');
        execSync(`node "${scriptPath}"`, { stdio: 'inherit', cwd: __dirname });
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

      // Ensure password_hash can store bcrypt hashes (≈60 chars).
      // Some earlier schemas used VARCHAR(12). We upgrade in-place for dev convenience.
      try {
        const t = String(cols.password_hash?.type || '');
        const m = t.match(/\b(?:character varying|varchar)\((\d+)\)/i);
        const len = m ? Number(m[1]) : null;
        if (len && len < 60) {
          await qi.changeColumn('utilizadores', 'password_hash', {
            type: Sequelize.STRING(255),
            allowNull: true,
          });
          console.log('🔧 Coluna utilizadores.password_hash expandida para suportar bcrypt.');
        }
      } catch (e) {
        console.error('⚠️ Falha ao atualizar schema de utilizadores.password_hash (continuando):', e.message || e);
      }

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

      const cCols = await qi.describeTable('consulta');
      if (!cCols.hora_consulta) {
        await qi.addColumn('consulta', 'hora_consulta', {
          type: Sequelize.TIME,
          allowNull: true,
        });
        console.log('🔧 Coluna consulta.hora_consulta adicionada.');
      }
      if (!cCols.duracao_min) {
        await qi.addColumn('consulta', 'duracao_min', {
          type: Sequelize.INTEGER,
          allowNull: true,
        });
        console.log('🔧 Coluna consulta.duracao_min adicionada.');
      }
    } catch (e) {
      console.error('⚠️ Falha ao garantir colunas (continuando):', e.message || e);
    }

    await createAdminUserIfNotFound();
    await seedGeneroIfEmpty();
    await seedEstadoCivilIfEmpty();
    await seedStatusConsultaIfMissing();
    await seedMedicosIfMissing();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend a correr em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Erro ao inicializar servidor:', err.stack || err.message || err);
    process.exitCode = 1;
  }
}

start();