import cors from "cors";
import "dotenv/config"; // Load environment variables
import express from "express";
import swaggerUi from "swagger-ui-express";
import { initializeORM } from "./config/database";
import { specs } from "./config/swagger";
import { tenantResolverMiddleware } from "./middleware/tenantResolver.middleware";
import { organisationRoutes } from "./routes/public/organisation.routes";
import { systemAdminRoutes } from "./routes/public/systemAdmin.routes";
import { planRoutes } from "./routes/public/plan.routes";
import { featureRoutes } from "./routes/public/feature.routes";
import { userRoutes } from "./routes/tenant/user.routes";
import { planFeatureRoutes } from "./routes/public/planFeatures.routes";
import { apiUsageRoutes } from "./routes/public/apiUsage.routes";
import { organisationPlanRoutes } from "./routes/public/organisationPlan.routes";

const app = express();

// CORS configuration
const corsOptions = {
  origin: ["http://localhost:3000"], // Add your frontend URL
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

const port = process.env.PORT || 3001;

// Initialize MikroORM before starting the server
initializeORM()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize ORM:", err);
    process.exit(1);
  });

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(tenantResolverMiddleware);

// Serve Swagger UI static files without CORS
app.use(
  "/api-docs",
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(specs)
);

// Routes
app.use("/api/organisations", organisationRoutes);
app.use("/api/system-admins", systemAdminRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/features", featureRoutes);
app.use("/api/plan-features", planFeatureRoutes);
app.use("/api/api-usage", apiUsageRoutes);
app.use("/api/organisation-plans", organisationPlanRoutes);

// Tenant-specific routes

app.use("/api/tenant/users", userRoutes);

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      status: "error",
      message: err.message || "Internal server error",
    });
  }
);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
