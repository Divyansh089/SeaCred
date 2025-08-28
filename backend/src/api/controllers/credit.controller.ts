import { Request, Response } from 'express';
import * as creditService from '../services/credit.service';

export const getCreditStatsHandler = async (req: Request, res: Response) => {
  try {
    // Assuming auth middleware places the user object in res.locals
    const user = res.locals.user;
    const stats = await creditService.getCreditStats(user);
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching credit stats', error });
  }
};