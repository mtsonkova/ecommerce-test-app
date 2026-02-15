import { prisma } from '../../../../lib/prisma';
import { requireAuth } from '../../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { reason } = req.body;

  try {
    // Find order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: true,
        refunds: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check ownership
    if (order.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to return this order' });
    }

    // Check if order can be returned
    if (!['delivered', 'processing', 'shipped'].includes(order.status)) {
      return res.status(400).json({ 
        error: `Cannot return order with status: ${order.status}` 
      });
    }

    // Check if already returned
    if (order.status === 'returned') {
      return res.status(400).json({ error: 'Order already returned' });
    }

    // Check if refund already exists
    const existingRefund = order.refunds.find(r => r.status === 'pending' || r.status === 'approved');
    if (existingRefund) {
      return res.status(400).json({ error: 'Return request already exists' });
    }

    // Create return request
    const [updatedOrder, refund] = await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: {
          status: 'returned',
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      }),
      prisma.refund.create({
        data: {
          orderId: id,
          amount: order.totalAmount,
          reason: reason || 'Customer requested return',
          status: 'pending',
        },
      }),
    ]);

    res.status(200).json({
      message: 'Return request submitted successfully',
      order: updatedOrder,
      refund,
    });
  } catch (error) {
    console.error('Return order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAuth(handler);
