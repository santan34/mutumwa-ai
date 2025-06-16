import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger";
import { organisationRoutes } from "./routes/organisation.routes";
import { entityManagerMiddleware } from "./middleware/entityManager.middleware";
import { initializeORM } from "./config/database";

export const startServer = async () => {
  try {
    // Initialize ORM before setting up Express
    const orm = await initializeORM();
    console.log("✅ Database connection established");

    const app = express();

    // CORS configuration
    const corsOptions = {
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    };

    // Middleware
    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(entityManagerMiddleware);

    // Swagger Docs (public endpoint)
    app.use(
      "/api-docs",
      (req: Request, res: Response, next: NextFunction) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        next();
      },
      swaggerUi.serve,
      swaggerUi.setup(specs)
    );

    // Routes
    app.use("/api/organisations", organisationRoutes);

    // Error handling middleware
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error(err.stack);
      res.status(500).json({
        status: "error",
        message: err.message || "Internal server error",
      });
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`✅ Server is running at http://localhost:${PORT}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      console.log("📥 Shutting down server...");
      await orm.close();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
    process.exit(1);
  }
};
