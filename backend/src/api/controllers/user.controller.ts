import { Request, Response } from 'express';
import * as userService from '../services/user.service';

export const getOfficersHandler = async (req: Request, res: Response) => {
  try {
    const officers = await userService.getOfficers();
    res.status(200).json(officers);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching officers', error: error.message });
  }
};

export const getMyProfileHandler = async (req: Request, res: Response) => {
  try {
    const user = await userService.getMyProfile(res.locals.user.id);
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

export const updateMyProfileHandler = async (req: Request, res: Response) => {
  try {
    const user = await userService.updateMyProfile(res.locals.user.id, req.body);
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

export const changeMyPasswordHandler = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await userService.changeMyPassword(res.locals.user.id, currentPassword, newPassword);
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error: any) {
    if (error.message.includes('Incorrect current password')) {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
};

export const getUserStatsHandler = async (req: Request, res: Response) => {
  try {
    const stats = await userService.getUserStats();
    res.status(200).json(stats);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching user stats', error: error.message });
  }
};