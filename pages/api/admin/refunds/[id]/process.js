import { prisma } from '../../../../../lib/prisma';
import { requireAdmin } from '../../../../../lib/auth';
import { FakePaymentProcessor } from '../../../../../lib/payment';

async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { status } = req.body; // 'approved' or 'rejected'

  try {
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        error: 'Status must be either "approved" or "rejected"' 
      });
    }

    const refund = await prisma.refund.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            orderItems: true,
          },
        },
      },
    });

    if (!refund) {
      return res.status(404).json({ error: 'Refund request not found' });
    }

    if (refund.status !== 'pending') {
      return res.status(400).json({ 
        error: `Refund already ${refund.status}` 
      });
    }

    if (status === 'approved') {
      // Process refund payment
      const paymentResult = await FakePaymentProcessor.processRefund(
        `ORDER_${refund.orderId}`,
        refund.amount
      );

      // Update refund and order, restore stock
      await prisma.$transaction(async (tx) => {
        // Restore product stock
        for (const item of refund.order.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }

        // Update refund
        await tx.refund.update({
          where: { id },
          data: { status: 'approved' },
        });

        // Update order payment status
        await tx.order.update({
          where: { id: refund.orderId },
          data: { paymentStatus: 'refunded' },
        });
      });

      const updatedRefund = await prisma.refund.findUnique({
        where: { id },
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
                  product: true,
                },
              },
            },
          },
        },
      });

      res.status(200).json({
        message: 'Refund approved and processed successfully',
        refund: updatedRefund,
        paymentResult,
      });
    } else {
      // Reject refund
      const updatedRefund = await prisma.refund.update({
        where: { id },
        data: { status: 'rejected' },
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
            },
          },
        },
      });

      res.status(200).json({
        message: 'Refund rejected',
        refund: updatedRefund,
      });
    }
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAdmin(handler);
