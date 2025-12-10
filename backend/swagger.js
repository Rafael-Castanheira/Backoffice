const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Backoffice API',
      version: '1.0.0',
      description: 'API documentation for the Backoffice project',
    },
    servers: [
      {
        url: 'http://localhost:3001',
      },
    ],
  },
  // Scan the routes folder for JSDoc annotations
  apis: [path.join(__dirname, 'routes', '*.js')],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
