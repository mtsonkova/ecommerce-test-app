import { prisma } from '../../../../../lib/prisma';
import { requireAdmin } from '../../../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { isBlocked } = req.body;

  try {
    // Check if trying to block themselves
    if (id === req.user.userId) {
      return res.status(400).json({ error: 'Cannot block yourself' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isBlocked },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isBlocked: true,
      },
    });

    res.status(200).json({
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user,
    });
  } catch (error) {
    console.error('Block/unblock user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAdmin(handler);
