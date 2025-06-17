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
        url: "http://localhost.afrainity.com",
        description: "Development server",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"], // Path to the API routes
};

export const specs = swaggerJsdoc(options);
