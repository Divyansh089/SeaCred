import { Request, Response } from 'express';
import * as distributionService from '../services/distribution.service';

export const getDistributionsHandler = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await distributionService.getDistributions(user, { page, limit });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching distributions', error });
  }
};