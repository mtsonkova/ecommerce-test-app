import { prisma } from '../../../../lib/prisma';
import { requireAdmin } from '../../../../lib/auth';

async function handler(req, res) {
  if (req.method === 'GET') {
    // Get all users
    try {
      const { page = 1, limit = 20, role, isBlocked, search } = req.query;

      const where = {};
      if (role) where.role = role;
      if (isBlocked !== undefined) where.isBlocked = isBlocked === 'true';
      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isBlocked: true,
            createdAt: true,
            _count: {
              select: { orders: true },
            },
          },
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      res.status(200).json({
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAdmin(handler);
