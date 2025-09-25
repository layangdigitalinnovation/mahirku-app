import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import User from '../models/User';
import Role from '../models/Role';
import ThinkingStyleResult from '../models/ThinkingStyleResult';
import TokenPurchase from '../models/TokenPurchase';
import Package from '../models/Package';
import WithdrawRequest from '../models/WithdrawRequest';
import { Op } from 'sequelize';

/**
 * Mendapatkan statistik dashboard admin yang komprehensif
 */
export const getDashboardStatistics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    const whereClause: any = {};
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }

    // 1. User Statistics
    console.log('Starting user statistics queries...');
    let totalUsers, usersByRole, totalTests;
    
    try {
      totalUsers = await User.count();
      console.log('✅ totalUsers query successful');
    } catch (error) {
      console.error('❌ Error in totalUsers query:', error);
      throw error;
    }
    
    try {
      usersByRole = await User.findAll({
        attributes: [
          'roleId',
          [User.sequelize!.fn('COUNT', User.sequelize!.col('User.id')), 'count']
        ],
        include: [{
          model: Role,
          as: 'role',
          attributes: ['name']
        }],
        group: ['User.roleId', 'role.id', 'role.name'],
        raw: false
      });
      console.log('✅ usersByRole query successful');
    } catch (error) {
      console.error('❌ Error in usersByRole query:', error);
      throw error;
    }

    // 2. Test Statistics
    try {
      totalTests = await ThinkingStyleResult.count();
      console.log('✅ totalTests query successful');
    } catch (error) {
      console.error('❌ Error in totalTests query:', error);
      throw error;
    }
    
    // 3. Token Purchase Statistics
    let completedPurchases;
    try {
      completedPurchases = await TokenPurchase.findAll({
        where: {
          ...whereClause,
          paymentStatus: 'paid'
        },
        include: [{
          model: Package
        }]
      });
      console.log('✅ completedPurchases query successful');
    } catch (error) {
      console.error('❌ Error in completedPurchases query:', error);
      throw error;
    }

    const totalRevenue = completedPurchases.reduce((sum, purchase) => {
      return sum + (purchase.totalAmount || 0);
    }, 0);

    const totalTokensSold = completedPurchases.reduce((sum, purchase) => {
      return sum + (purchase.totalToken || 0);
    }, 0);

    // Process package statistics
    const packageStatsMap = completedPurchases.reduce((acc: any, purchase: any) => {
      const packageName = purchase.Package?.name || 'Unknown Package';
      if (!acc[packageName]) {
        acc[packageName] = {
          count: 0,
          revenue: 0,
          tokens: 0
        };
      }
      acc[packageName].count += 1;
      acc[packageName].revenue += purchase.totalAmount || 0;
      acc[packageName].tokens += purchase.totalToken || 0;
      return acc;
    }, {});

    // 5. Monthly Growth Data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    let monthlyUserGrowth, monthlyTestGrowth, monthlyRevenueGrowth;
    
    try {
      monthlyUserGrowth = await User.findAll({
        attributes: [
          [User.sequelize!.fn('TO_CHAR', User.sequelize!.col('User.createdAt'), 'YYYY-MM'), 'month'],
          [User.sequelize!.fn('COUNT', User.sequelize!.col('User.id')), 'count']
        ],
        where: {
          createdAt: {
            [Op.gte]: sixMonthsAgo
          }
        },
        group: [User.sequelize!.fn('TO_CHAR', User.sequelize!.col('User.createdAt'), 'YYYY-MM')],
        order: [[User.sequelize!.fn('TO_CHAR', User.sequelize!.col('User.createdAt'), 'YYYY-MM'), 'ASC']],
        raw: true
      });
      console.log('✅ monthlyUserGrowth query successful');
    } catch (error) {
      console.error('❌ Error in monthlyUserGrowth query:', error);
      throw error;
    }

    try {
      monthlyTestGrowth = await ThinkingStyleResult.findAll({
        attributes: [
          [ThinkingStyleResult.sequelize!.fn('TO_CHAR', ThinkingStyleResult.sequelize!.col('ThinkingStyleResult.createdAt'), 'YYYY-MM'), 'month'],
          [ThinkingStyleResult.sequelize!.fn('COUNT', ThinkingStyleResult.sequelize!.col('ThinkingStyleResult.id')), 'count']
        ],
        where: {
          createdAt: {
            [Op.gte]: sixMonthsAgo
          }
        },
        group: [ThinkingStyleResult.sequelize!.fn('TO_CHAR', ThinkingStyleResult.sequelize!.col('ThinkingStyleResult.createdAt'), 'YYYY-MM')],
        order: [[ThinkingStyleResult.sequelize!.fn('TO_CHAR', ThinkingStyleResult.sequelize!.col('ThinkingStyleResult.createdAt'), 'YYYY-MM'), 'ASC']],
        raw: true
      });
      console.log('✅ monthlyTestGrowth query successful');
    } catch (error) {
      console.error('❌ Error in monthlyTestGrowth query:', error);
      throw error;
    }

    try {
      monthlyRevenueGrowth = await TokenPurchase.findAll({
        attributes: [
          [TokenPurchase.sequelize!.fn('TO_CHAR', TokenPurchase.sequelize!.col('TokenPurchase.createdAt'), 'YYYY-MM'), 'month'],
          [TokenPurchase.sequelize!.fn('SUM', TokenPurchase.sequelize!.col('TokenPurchase.totalAmount')), 'revenue']
        ],
        where: {
          createdAt: {
            [Op.gte]: sixMonthsAgo
          },
          paymentStatus: 'paid'
        },
        group: [TokenPurchase.sequelize!.fn('TO_CHAR', TokenPurchase.sequelize!.col('TokenPurchase.createdAt'), 'YYYY-MM')],
        order: [[TokenPurchase.sequelize!.fn('TO_CHAR', TokenPurchase.sequelize!.col('TokenPurchase.createdAt'), 'YYYY-MM'), 'ASC']],
        raw: true
      });
      console.log('✅ monthlyRevenueGrowth query successful');
    } catch (error) {
      console.error('❌ Error in monthlyRevenueGrowth query:', error);
      throw error;
    }

    // 6. Withdraw Statistics
    let withdrawStats;
    try {
      withdrawStats = await WithdrawRequest.findAll({
        where: whereClause,
        attributes: [
          'status',
          [WithdrawRequest.sequelize!.fn('COUNT', WithdrawRequest.sequelize!.col('WithdrawRequest.id')), 'count'],
          [WithdrawRequest.sequelize!.fn('SUM', WithdrawRequest.sequelize!.col('WithdrawRequest.amount')), 'totalAmount']
        ],
        group: ['WithdrawRequest.status'],
        raw: true
      });
      console.log('✅ withdrawStats query successful');
    } catch (error) {
      console.error('❌ Error in withdrawStats query:', error);
      throw error;
    }

    // Process monthly data
    const monthlyData = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = monthNames[date.getMonth()];

      const userGrowth = (monthlyUserGrowth as any[]).find((item: any) => item.month === monthKey);
      const testGrowth = (monthlyTestGrowth as any[]).find((item: any) => item.month === monthKey);
      const revenueGrowth = (monthlyRevenueGrowth as any[]).find((item: any) => item.month === monthKey);

      monthlyData.push({
        bulan: monthName,
        pengguna: parseInt(userGrowth?.count || '0'),
        tes: parseInt(testGrowth?.count || '0'),
        keuntungan: parseFloat(revenueGrowth?.revenue || '0')
      });
    }

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalTests,
          totalRevenue,
          totalTokensSold,
          totalPurchases: completedPurchases.length
        },
        usersByRole: usersByRole.map((item: any) => ({
          role: item.role?.name || 'Unknown',
          count: parseInt(item.dataValues.count)
        })),
        packageStats: Object.entries(packageStatsMap).map(([packageName, stats]: [string, any]) => ({
          packageName,
          count: stats.count,
          revenue: stats.revenue,
          tokens: stats.tokens
        })),
        monthlyData,
        withdrawStats
      }
    });

  } catch (error) {
    console.error('Error getting dashboard statistics:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error message:', error instanceof Error ? error.message : error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Mendapatkan statistik real-time untuk dashboard
 */
export const getRealtimeStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get today's statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayUsers = await User.count({
      where: {
        createdAt: {
          [Op.between]: [today, tomorrow]
        }
      }
    });

    const todayTests = await ThinkingStyleResult.count({
      where: {
        createdAt: {
          [Op.between]: [today, tomorrow]
        }
      }
    });

    const todayRevenue = await TokenPurchase.sum('totalAmount', {
      where: {
        createdAt: {
          [Op.between]: [today, tomorrow]
        },
        paymentStatus: 'paid'
      }
    });

    const pendingWithdraws = await WithdrawRequest.count({
      where: {
        status: 'pending'
      }
    });

    res.status(200).json({
      success: true,
      data: {
        todayUsers,
        todayTests,
        todayRevenue: todayRevenue || 0,
        pendingWithdraws
      }
    });

  } catch (error) {
    console.error('Error getting realtime statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};