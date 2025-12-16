const express = require('express');
const cors = require('cors');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

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
app.use('/tipo_notificacao', require('./routes/tipo_notificacao_route'));
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
      },
    });

    if (wasAdminCreated) {
        console.log("-> Utilizador 'admin@local' (ID 9999) criado com sucesso.");
    }

  } catch (error) {
    console.error('❌ Erro ao criar utilizador admin default:', error);
  }
}

// Usamos db.sequelize.sync() para garantir que a BD está ligada
// antes de o servidor começar a aceitar pedidos.
async function start() {
  try {
    // Try to authenticate and sync DB, but don't prevent the server from starting if DB is down.
    await db.sequelize.authenticate();
    await db.sequelize.sync();
    console.log('✅ Base de dados ligada com sucesso.');

    // Create the default admin user if it doesn't exist
    await createAdminUserIfNotFound();

  } catch (err) {
    console.error('❌ Erro ao ligar à base de dados:', err.message || err);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Servidor backend a correr em http://localhost:${PORT}`);
  });
}

start();