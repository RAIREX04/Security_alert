const swaggerJsdoc = require('swagger-jsdoc');

function buildSwaggerSpec() {
  return swaggerJsdoc({
    definition: {
      openapi: '3.0.3',
      info: {
        title: 'Management Emergency API',
        version: '1.0.0',
        description: 'API backend React Native + Express + SQL Server',
      },
      servers: [
        {
          url: 'http://localhost:3000/api',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    apis: [],
  });
}

module.exports = { buildSwaggerSpec };
