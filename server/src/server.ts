import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';
import { organisationRoutes } from './routes/organisation.routes';

export const startServer = async () => {
  const app = express();

  // CORS configuration
  const corsOptions = {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  };

  // Middleware
  app.use(cors(corsOptions));
  app.use(express.json());

  // Swagger Docs (public endpoint)
  app.use(
    '/api-docs',
    (req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      next();
    },
    swaggerUi.serve,
    swaggerUi.setup(specs)
  );

  // Routes
  app.use('/api/organisations', organisationRoutes);

  // Error handling middleware
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
      status: 'error',
      message: err.message || 'Internal server error',
    });
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Server is running at http://localhost:${PORT}`);
  });
};
