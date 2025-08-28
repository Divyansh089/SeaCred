import { CreditDistributionModel } from '../database/models/creditDistribution.model';
import { CarbonCreditModel } from '../database/models/carbonCredit.model';
import { IUserDocument } from '../types';

// Calculates credit stats based on user role
export const getCreditStats = async (user: IUserDocument) => {
  let totalCredits = 0;
  let availableCredits = 0;

  if (user.role === 'admin') {
    // Admin sees system-wide stats from the CarbonCredit collection
    const totalResult = await CarbonCreditModel.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const availableResult = await CarbonCreditModel.aggregate([
      { $match: { status: 'available' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    totalCredits = totalResult[0]?.total || 0;
    availableCredits = availableResult[0]?.total || 0;
  } else {
    // Officer and Authority see stats based on their share in distributions
    const matchField = user.role === 'officer' ? 'officerId' : 'authorityId';
    const shareField = user.role === 'officer' ? '$distribution.officerShare' : '$distribution.authorityShare';

    const results = await CreditDistributionModel.aggregate([
      { $match: { [matchField]: user._id, status: 'distributed' } },
      {
        $group: {
          _id: null,
          total: {
            $sum: { $multiply: ['$totalCredits', { $divide: [shareField, 100] }] }
          }
        }
      }
    ]);
    totalCredits = results[0]?.total || 0;
    // For this page, an officer/authority's available credits are their total distributed share
    availableCredits = totalCredits;
  }

  return { totalCredits, availableCredits };
};