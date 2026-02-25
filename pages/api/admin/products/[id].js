import { prisma } from '../../../../../lib/prisma';
import { requireAdmin } from '../../../../../lib/auth';

async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    // Update product
    try {
      const { name, description, price, stock, categoryId, discount, imageUrl } = req.body;

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (price !== undefined) updateData.price = parseFloat(price);
      if (stock !== undefined) updateData.stock = parseInt(stock, 10);
      if (categoryId !== undefined) updateData.categoryId = categoryId;
      if (discount !== undefined) updateData.discount = parseFloat(discount);
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

      const product = await prisma.product.update({
        where: { id },
        data: updateData,
      });

      res.status(200).json({
        message: 'Product updated successfully',
        product,
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    // Delete product
    try {
      // Check if product is in any pending orders
      const ordersWithProduct = await prisma.orderItem.findMany({
        where: {
          productId: id,
          order: {
            status: {
              in: ['pending', 'processing'],
            },
          },
        },
      });

      if (ordersWithProduct.length > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete product with pending orders' 
        });
      }

      await prisma.product.delete({
        where: { id },
      });

      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAdmin(handler);