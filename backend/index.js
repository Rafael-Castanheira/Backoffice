const express = require('express');
const cors = require('cors');

// 1. Importar a sua configuração da Base de Dados (o ficheiro models/index.js)
const db = require('./models'); // O Node.js procura ./models/index.js automaticamente

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve raw OpenAPI JSON for tools that expect a .json/.yaml URL
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Mount routes
app.use('/consulta', require('./routes/consulta_route'));

// Rota de Teste
app.get('/', (req, res) => {
  res.json({ message: 'O servidor Express está a funcionar!' });
});

// --- Iniciar o Servidor e a Base de Dados ---

// Usamos db.sequelize.sync() para garantir que a BD está ligada
// antes de o servidor começar a aceitar pedidos.
async function start() {
  try {
    // Try to authenticate and sync DB, but don't prevent the server from starting if DB is down.
    await db.sequelize.authenticate();
    await db.sequelize.sync();
    console.log('✅ Base de dados ligada com sucesso.');
  } catch (err) {
    console.error('❌ Erro ao ligar à base de dados:', err.message || err);
    console.warn('⚠️ Iniciando o servidor mesmo sem ligação à base de dados. Swagger estará disponível.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Servidor backend a correr em http://localhost:${PORT}`);
  });
}

start();