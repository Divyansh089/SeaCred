import { Request, Response } from 'express';
import * as verificationService from '../services/verification.service';

export const getStatsHandler = async (req: Request, res: Response) => {
  try {
    const stats = await verificationService.getVerificationStats(res.locals.user);
    res.status(200).json(stats);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

export const getProjectsHandler = async (req: Request, res: Response) => {
    try {
        const projects = await verificationService.getProjectsForVerification(req.query, res.locals.user);
        res.status(200).json(projects);
    } catch (e: any) {
        res.status(500).json({ message: e.message });
    }
}