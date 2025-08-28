import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../../database/models/user.model';
import { IUser } from '../../types';
import { config } from '../../config';

export const registerUser = async (userData: IUser) => {
  // Check if user already exists
  const existingUser = await UserModel.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(userData.password, 12);

  // Create and save the new user
  const newUser = await UserModel.create({
    ...userData,
    password: hashedPassword,
  });

  // Don't return the password
  newUser.password = undefined;
  return newUser;
};

export const loginUser = async (email: string, password: string) => {
  // Find user and explicitly include password
  const user = await UserModel.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Check if password is correct
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // Create JWT payload
  const payload = {
    id: user._id,
    role: user.role,
  };

  // Sign the token
  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  // Prepare user object to return (without password)
  user.password = undefined;
  return { token, user };
};