import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import WithdrawRequest from '../models/WithdrawRequest';
import AffiliateBalance from '../models/AffiliateBalance';
import User from '../models/User';
import { getAffiliateBalance } from '../utils/affiliateUtils';
import { Op } from 'sequelize';
import { processAutomaticPayout } from './xenditController';

/**
 * Membuat permintaan withdraw baru
 */
export const createWithdrawRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, bankName, accountNumber, accountName, notes } = req.body;
    const affiliateId = req.user?.userId; // Assuming user is authenticated

    if (!affiliateId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    // Validasi input
    if (!amount || !bankName || !accountNumber || !accountName) {
      res.status(400).json({
        success: false,
        message: 'Amount, bank name, account number, and account name are required'
      });
      return;
    }

    if (amount <= 0) {
      res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
      return;
    }

    // Cek saldo affiliator
    const balance = await getAffiliateBalance(affiliateId);
    
    if (amount > balance.availableBalance) {
      res.status(400).json({
        success: false,
        message: `Insufficient balance. Available balance: ${balance.availableBalance}`,
        data: {
          requestedAmount: amount,
          availableBalance: balance.availableBalance
        }
      });
      return;
    }

    // Cek apakah ada permintaan withdraw yang masih pending
    const pendingRequest = await WithdrawRequest.findOne({
      where: {
        affiliateId,
        status: 'pending'
      }
    });

    if (pendingRequest) {
      res.status(400).json({
        success: false,
        message: 'You have a pending withdraw request. Please wait for it to be processed.'
      });
      return;
    }

    // Buat permintaan withdraw
    const withdrawRequest = await WithdrawRequest.create({
      affiliateId,
      amount,
      bankName,
      accountNumber,
      accountName,
      notes: notes || null,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Withdraw request created successfully',
      data: withdrawRequest
    });

  } catch (error) {
    console.error('Error creating withdraw request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Mendapatkan riwayat withdraw request untuk affiliator
 */
export const getWithdrawHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const affiliateId = req.user?.userId;
    const { page = 1, limit = 10, status } = req.query;

    if (!affiliateId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const offset = (Number(page) - 1) * Number(limit);
    const whereClause: any = { affiliateId };
    
    if (status && ['pending', 'approved', 'rejected', 'processed'].includes(status as string)) {
      whereClause.status = status;
    }

    const { rows: withdrawRequests, count } = await WithdrawRequest.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'processedByUser',
          attributes: ['id', 'fullname', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset
    });

    res.status(200).json({
      success: true,
      data: {
        withdrawRequests,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(count / Number(limit)),
          totalItems: count,
          itemsPerPage: Number(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error getting withdraw history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Mendapatkan semua withdraw requests (untuk admin)
 */
export const getAllWithdrawRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, affiliateId } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    const whereClause: any = {};
    
    if (status && ['pending', 'approved', 'rejected', 'processed'].includes(status as string)) {
      whereClause.status = status;
    }
    
    if (affiliateId) {
      whereClause.affiliateId = affiliateId;
    }

    const { rows: withdrawRequests, count } = await WithdrawRequest.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'affiliate',
          attributes: ['id', 'fullname', 'email']
        },
        {
          model: User,
          as: 'processedByUser',
          attributes: ['id', 'fullname', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset
    });

    res.status(200).json({
      success: true,
      data: {
        withdrawRequests,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(count / Number(limit)),
          totalItems: count,
          itemsPerPage: Number(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error getting all withdraw requests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Approve withdraw request (untuk admin)
 */
export const approveWithdrawRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const withdrawRequest = await WithdrawRequest.findByPk(id);
    
    if (!withdrawRequest) {
      res.status(404).json({
        success: false,
        message: 'Withdraw request not found'
      });
      return;
    }

    if (withdrawRequest.status !== 'pending') {
      res.status(400).json({
        success: false,
        message: 'Only pending requests can be approved'
      });
      return;
    }

    // Update status ke approved
    await withdrawRequest.approve(adminId, notes);

    // Proses payout otomatis menggunakan Xendit
    try {
      const payoutResult = await processAutomaticPayout(withdrawRequest.id.toString());
      
      if (payoutResult.success) {
        res.status(200).json({
          success: true,
          message: 'Withdraw request approved and payout processed successfully',
          data: {
            withdrawRequest,
            payout: {
              id: payoutResult.payoutId,
              message: payoutResult.message
            }
          }
        });
      } else {
        // Jika payout gagal, tetap approve tapi beri informasi
        res.status(200).json({
          success: true,
          message: 'Withdraw request approved but automatic payout failed. Manual processing required.',
          data: {
            withdrawRequest,
            payoutError: payoutResult.message
          }
        });
      }
    } catch (payoutError: any) {
      // Jika ada error dalam payout, tetap approve tapi beri informasi
      console.error('Payout processing error:', payoutError);
      res.status(200).json({
        success: true,
        message: 'Withdraw request approved but automatic payout encountered an error. Manual processing required.',
        data: {
          withdrawRequest,
          payoutError: payoutError.message || 'Unknown payout error'
        }
      });
    }

  } catch (error) {
    console.error('Error approving withdraw request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Reject withdraw request (untuk admin)
 */
export const rejectWithdrawRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!rejectionReason) {
      res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const withdrawRequest = await WithdrawRequest.findByPk(id);
    
    if (!withdrawRequest) {
      res.status(404).json({
        success: false,
        message: 'Withdraw request not found'
      });
      return;
    }

    if (withdrawRequest.status !== 'pending') {
      res.status(400).json({
        success: false,
        message: 'Only pending requests can be rejected'
      });
      return;
    }

    // Update status ke rejected
    await withdrawRequest.reject(adminId, rejectionReason);

    res.status(200).json({
      success: true,
      message: 'Withdraw request rejected successfully',
      data: withdrawRequest
    });

  } catch (error) {
    console.error('Error rejecting withdraw request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Mark withdraw request as processed (untuk admin)
 */
export const markAsProcessed = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const withdrawRequest = await WithdrawRequest.findByPk(id);
    
    if (!withdrawRequest) {
      res.status(404).json({
        success: false,
        message: 'Withdraw request not found'
      });
      return;
    }

    if (withdrawRequest.status !== 'approved') {
      res.status(400).json({
        success: false,
        message: 'Only approved requests can be marked as processed'
      });
      return;
    }

    // Update affiliate balance - kurangi available balance dan tambah withdrawn amount
    const affiliateBalance = await AffiliateBalance.findOne({
      where: { affiliateId: withdrawRequest.affiliateId }
    });

    if (affiliateBalance) {
      await affiliateBalance.withdraw(withdrawRequest.amount);
    }

    // Mark as processed
    await withdrawRequest.markAsProcessed(adminId, notes);

    res.status(200).json({
      success: true,
      message: 'Withdraw request marked as processed successfully',
      data: withdrawRequest
    });

  } catch (error) {
    console.error('Error marking withdraw request as processed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Mendapatkan detail withdraw request
 */
export const getWithdrawRequestDetail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const withdrawRequest = await WithdrawRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: 'affiliate',
          attributes: ['id', 'fullname', 'email']
        },
        {
          model: User,
          as: 'processedByUser',
          attributes: ['id', 'fullname', 'email']
        }
      ]
    });
    
    if (!withdrawRequest) {
      res.status(404).json({
        success: false,
        message: 'Withdraw request not found'
      });
      return;
    }

    // Check authorization - user can only see their own requests, admin can see all
    if (userRole !== 'admin' && withdrawRequest.affiliateId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: withdrawRequest
    });

  } catch (error) {
    console.error('Error getting withdraw request detail:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Mendapatkan statistik withdraw untuk dashboard admin
 */
export const getWithdrawStatistics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    const whereClause: any = {};
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }

    // Total requests by status
    const statusCounts = await WithdrawRequest.findAll({
      where: whereClause,
      attributes: [
        'status',
        [WithdrawRequest.sequelize!.fn('COUNT', WithdrawRequest.sequelize!.col('id')), 'count'],
        [WithdrawRequest.sequelize!.fn('SUM', WithdrawRequest.sequelize!.col('amount')), 'totalAmount']
      ],
      group: ['status'],
      raw: true
    });

    // Total processed amount
    const processedTotal = await WithdrawRequest.sum('amount', {
      where: {
        ...whereClause,
        status: 'processed'
      }
    });

    // Pending amount
    const pendingTotal = await WithdrawRequest.sum('amount', {
      where: {
        ...whereClause,
        status: 'pending'
      }
    });

    res.status(200).json({
      success: true,
      data: {
        statusCounts,
        processedTotal: processedTotal || 0,
        pendingTotal: pendingTotal || 0
      }
    });

  } catch (error) {
    console.error('Error getting withdraw statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};