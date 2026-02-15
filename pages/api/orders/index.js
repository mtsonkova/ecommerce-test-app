import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth';
import { FakePaymentProcessor } from '../../../lib/payment';

async function handler(req, res) {
  if (req.method === 'GET') {
    // Get user's orders
    try {
      const { status, page = 1, limit = 10 } = req.query;
      
      const where = { userId: req.user.userId };
      if (status) {
        where.status = status;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            orderItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    imageUrl: true,
                  },
                },
              },
            },
            refunds: true,
          },
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.order.count({ where }),
      ]);

      res.status(200).json({
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    // Create new order
    try {
      const { items, shippingAddress, paymentDetails } = req.body;

      // Validate input
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Order items are required' });
      }

      if (!shippingAddress) {
        return res.status(400).json({ error: 'Shipping address is required' });
      }

      if (!paymentDetails || !paymentDetails.cardNumber) {
        return res.status(400).json({ error: 'Payment details are required' });
      }

      // Fetch products and check stock
      const productIds = items.map(item => item.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      if (products.length !== productIds.length) {
        return res.status(400).json({ error: 'Some products not found' });
      }

      // Calculate total and check stock
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const product = products.find(p => p.id === item.productId);
        
        if (product.stock < item.quantity) {
          return res.status(400).json({ 
            error: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
          });
        }

        const finalPrice = product.price * (1 - product.discount / 100);
        const itemTotal = finalPrice * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: finalPrice,
        });
      }

      // Process payment
      const paymentResult = await FakePaymentProcessor.processPayment(
        paymentDetails,
        totalAmount
      );

      if (!paymentResult.success) {
        return res.status(400).json({ 
          error: `Payment failed: ${paymentResult.error}` 
        });
      }

      // Create order in transaction
      const order = await prisma.$transaction(async (tx) => {
        // Update product stock
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        // Create order
        return tx.order.create({
          data: {
            userId: req.user.userId,
            totalAmount,
            status: 'pending',
            paymentStatus: 'paid',
            paymentMethod: paymentDetails.cardType || 'credit_card',
            cardLast4: paymentDetails.cardNumber.slice(-4),
            shippingAddress,
            orderItems: {
              create: orderItems,
            },
          },
          include: {
            orderItems: {
              include: {
                product: true,
              },
            },
          },
        });
      });

      res.status(201).json({
        message: 'Order created successfully',
        order,
        paymentResult,
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAuth(handler);
