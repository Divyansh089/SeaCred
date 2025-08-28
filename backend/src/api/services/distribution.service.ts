import { CreditDistributionModel } from '../database/models/creditDistribution.model';
import { IUserDocument } from '../types';

interface PaginationOptions {
  page?: number;
  limit?: number;
}

// Fetches a paginated list of distributions based on user role
export const getDistributions = async (user: IUserDocument, options: PaginationOptions = {}) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  const query: any = {};
  if (user.role === 'officer') {
    query.officerId = user._id;
  } else if (user.role === 'project_authority') {
    query.authorityId = user._id;
  }
  // Admin query object remains empty to fetch all

  const distributions = await CreditDistributionModel.find(query)
    .populate('projectId', 'name') // Fetch the project name
    .sort({ distributedAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalItems = await CreditDistributionModel.countDocuments(query);

  return {
    data: distributions,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
    },
  };
};