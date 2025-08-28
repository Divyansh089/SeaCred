import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export const registerHandler = async (req: Request, res: Response) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error: any) {
    // Handle specific error for existing user
    if (error.message.includes('already exists')) {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.loginUser(email, password);
    res.status(200).json({ token, user });
  } catch (error: any) {
    // For invalid credentials, send a 401 Unauthorized status
    if (error.message.includes('Invalid credentials')) {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};  