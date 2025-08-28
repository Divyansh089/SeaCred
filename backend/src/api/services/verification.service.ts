import { CarbonProjectModel } from '../../database/models/carbonProject.model';
import { IUserDocument } from '../../types';

// Get counts for the stats cards
export const getVerificationStats = async (user: IUserDocument) => {
  const baseQuery: any = {};
  if (user.role === 'officer') {
    // Officers only see stats for projects they can interact with
    baseQuery.$or = [{ assignedOfficerId: user._id }, { assignedOfficerId: null }];
  }

  const results = await CarbonProjectModel.aggregate([
    { $match: baseQuery },
    { $group: { _id: '$verificationStatus', count: { $sum: 1 } } }
  ]);
  
  const stats = { pending: 0, verified: 0, rejected: 0, inProgress: 0 };
  for (const res of results) {
    if (stats.hasOwnProperty(res._id)) {
      stats[res._id as keyof typeof stats] = res.count;
    }
  }

  // "In Progress" are pending projects that have an officer assigned
  stats.inProgress = await CarbonProjectModel.countDocuments({
      ...baseQuery,
      verificationStatus: 'pending',
      assignedOfficerId: { $ne: null }
  });

  return stats;
};

// Get projects list for the verification page with special officer filtering
export const getProjectsForVerification = async (queryParams: any, user: IUserDocument) => {
    const { status } = queryParams;
    const query: any = {};

    if (status && status !== 'all') {
        query.verificationStatus = status;
    }

    if (user.role === 'officer') {
        query.$or = [{ assignedOfficerId: user._id }, { assignedOfficerId: null }];
    }

    const projects = await CarbonProjectModel.find(query).sort({ createdAt: -1 });
    return projects;
};