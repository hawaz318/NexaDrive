import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "NexaDrive API",
      version: "1.0.0",
      description:
        "REST API for the NexaDrive file storage and management platform",
    },

    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server",
      },
    ],

    tags: [
      {
        name: "Health",
        description: "API health check",
      },
      {
        name: "Authentication",
        description: "Authentication endpoints",
      },
      {
        name: "Users",
        description: "User management endpoints",
      },
      {
        name: "Folders",
        description: "Folder management endpoints",
      },
      {
        name: "Files",
        description: "File management endpoints",
      },
      {
        name: "Sharing",
        description: "File and folder sharing endpoints",
      },
    ],
  },

  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);