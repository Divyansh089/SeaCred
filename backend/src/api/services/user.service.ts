import { UserModel } from '../../database/models/user.model';
import { IUserDocument } from '../../types';
import bcrypt from 'bcryptjs';

// Get all users with the 'officer' role
export const getOfficers = async () => {
  const officers = await UserModel.find({ role: 'officer' }).select('name email jurisdiction specialization');
  return officers;
};

// Get the profile of the currently logged-in user
export const getMyProfile = async (userId: string) => {
  // Exclude password from the result
  const user = await UserModel.findById(userId);
  return user;
};

// Update the profile of the currently logged-in user
export const updateMyProfile = async (userId: string, updateBody: any) => {
  const { name, email, notificationSettings, preferences } = updateBody;

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $set: { name, email, notificationSettings, preferences } },
    { new: true, runValidators: true } // Return the updated document
  );
  return user;
};

// Change the password for the currently logged-in user
export const changeMyPassword = async (userId: string, oldPass: string, newPass: string) => {
  // Get user and explicitly include the password for comparison
  const user = await UserModel.findById(userId).select('+password');
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(oldPass, user.password);
  if (!isMatch) {
    throw new Error('Incorrect current password');
  }

  user.password = await bcrypt.hash(newPass, 12);
  await user.save();
};

export const getUserStats = async () => {
  const stats = await UserModel.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: null,
        roles: { $push: { k: '$_id', v: '$count' } },
        total: { $sum: '$count' },
      },
    },
    {
      $replaceRoot: {
        newRoot: { $mergeObjects: [{ total: '$total' }, { $arrayToObject: '$roles' }] },
      },
    },
  ]);

  // Ensure all roles have a default value of 0 if they don't exist
  const result = stats[0] || {};
  return {
    total: result.total || 0,
    admin: result.admin || 0,
    officer: result.officer || 0,
    project_authority: result.project_authority || 0,
  };
};

export const queryUsers = async (queryParams: any) => {
  const { page = 1, limit = 10, role, search } = queryParams;
  const skip = (page - 1) * limit;
  const query: any = {};

  if (role && role !== 'all') {
    query.role = role;
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const users = await UserModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
  const totalItems = await UserModel.countDocuments(query);

  return {
    data: users,
    pagination: {
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
    },
  };
};

// Create a new user (Admin only)
export const createUser = async (userData: any) => {
  if (!userData.password) throw new Error('Password is required');
  const hashedPassword = await bcrypt.hash(userData.password, 12);
  const newUser = await UserModel.create({ ...userData, password: hashedPassword });
  newUser.password = undefined;
  return newUser;
};

// Update a user by ID (Admin only)
export const updateUserById = async (userId: string, updateBody: any) => {
  if (updateBody.password) {
    updateBody.password = await bcrypt.hash(updateBody.password, 12);
  } else {
    delete updateBody.password; // Prevent password from being set to null
  }
  const user = await UserModel.findByIdAndUpdate(userId, updateBody, { new: true });
  return user;
};

// Delete a user by ID (Admin only)
export const deleteUserById = async (userId: string) => {
  await UserModel.findByIdAndDelete(userId);
};