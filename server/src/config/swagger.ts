import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Organisation API Documentation",
      version: "1.0.0",
      description: "API documentation for the Organisation service",
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Development server",
      },
    ],
  },
  apis: [
    "./src/routes/**/*.ts",
    "./src/controllers/**/*.ts",
    "./src/entities/**/*.ts"
  ],
};

export const specs = swaggerJsdoc(options);
