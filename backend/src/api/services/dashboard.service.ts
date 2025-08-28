import { CarbonProjectModel } from '../database/models/carbonProject.model';
import { CarbonCreditModel } from '../database/models/carbonCredit.model';
import { ActivityModel } from '../database/models/activity.model';
import { IUserDocument } from '../types';

// Helper function to get data for the last 6 months for charts
const getMonthlyChartData = async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const projectData = await CarbonProjectModel.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { month: { $month: '$createdAt' } },
        projects: { $sum: 1 },
      },
    },
    { $sort: { '_id.month': 1 } },
  ]);

  const creditData = await CarbonCreditModel.aggregate([
    { $match: { issuedAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { month: { $month: '$issuedAt' } },
        credits: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.month': 1 } },
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartData = monthNames.map((name, index) => ({
    name,
    projects: projectData.find(p => p._id.month === index + 1)?.projects || 0,
    credits: creditData.find(c => c._id.month === index + 1)?.credits || 0,
  }));

  // Return only the last 6 months relative to today
  const currentMonthIndex = new Date().getMonth();
  return Array.from({ length: 6 }, (_, i) => {
    const monthIndex = (currentMonthIndex - 5 + i + 12) % 12;
    return chartData[monthIndex];
  });
};

// Main service function to gather all dashboard data
export const getDashboardData = async (user: IUserDocument) => {
  const authorityQuery = user.role === 'project_authority' ? { projectAuthorityId: user._id } : {};
  const officerProjectQuery = user.role === 'officer' ? { assignedOfficerId: user._id } : {};

  // 1. Fetch Stats Data
  const [
    totalProjects,
    activeCredits,
    verifiedProjects,
    pendingReviews,
  ] = await Promise.all([
    CarbonProjectModel.countDocuments(authorityQuery),
    CarbonCreditModel.aggregate([
      { $match: { status: 'available' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    CarbonProjectModel.countDocuments({ ...authorityQuery, status: 'approved' }),
    CarbonProjectModel.countDocuments({ ...officerProjectQuery, status: 'pending' }),
  ]);

  let stats = [
    { name: "Total Projects", stat: totalProjects },
    { name: "Active Credits", stat: activeCredits[0]?.total || 0 },
    { name: "Verified Projects", stat: verifiedProjects },
    { name: "Pending Reviews", stat: pendingReviews },
  ];

  // Filter stats based on role
  if (user.role === 'officer') {
    stats = stats.filter(s => s.name !== 'Total Projects');
  }
  if (user.role === 'project_authority') {
    stats = stats.filter(s => s.name === 'Total Projects' || s.name === 'Active Credits');
  }

  // 2. Fetch Chart Data (same for all roles in this design)
  const chartData = await getMonthlyChartData();

  // 3. Fetch Recent Activity
  const recentActivity = await ActivityModel.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('userId', 'name');

  const formattedActivity = recentActivity.map(act => ({
    id: act._id,
    type: act.type,
    description: act.description,
    userName: (act.userId as any)?.name || 'System',
    createdAt: act.createdAt,
  }));

  return { stats, chartData, recentActivity: formattedActivity };
};