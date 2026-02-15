import { prisma } from '../../../../lib/prisma';
import { requireAdmin } from '../../../../lib/auth';
import { FakePaymentProcessor } from '../../../../lib/payment';

async function handler(req, res) {
  if (req.method === 'GET') {
    // Get all refund requests
    try {
      const { status, page = 1, limit = 20 } = req.query;

      const where = {};
      if (status) where.status = status;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [refunds, total] = await Promise.all([
        prisma.refund.findMany({
          where,
          include: {
            order: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                  },
                },
                orderItems: {
                  include: {
                    product: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.refund.count({ where }),
      ]);

      res.status(200).json({
        refunds,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error('Get refunds error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAdmin(handler);
