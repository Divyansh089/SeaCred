import express, { Request, Response } from 'express';
import apiRoutes from './api/routes'; // Make sure you have this import

const app = express();
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP' });
});

// Use the API routes
app.use('/api/v1', apiRoutes);

export default app;