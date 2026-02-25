import { prisma } from '../../../../lib/prisma';
import { requireAdmin } from '../../../../lib/auth';

async function handler(req, res) {
  const { id } = req.query;

  // Guard: ensure id is present
  if (!id) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  if (req.method === 'PUT') {
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

      // Guard: ensure there's something to update
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No valid fields provided for update' });
      }

      const product = await prisma.product.update({
        where: { id },
        data: updateData,
      });

      return res.status(200).json({
        message: 'Product updated successfully',
        product,
      });
    } catch (error) {
      console.error('Update product error:', error);

      // Handle "record not found" specifically (Prisma P2025)
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Product not found' });
      }

      return res.status(500).json({ error: 'Internal server error' });
    }

  } else if (req.method === 'DELETE') {
    try {
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
          error: 'Cannot delete product with pending orders',
        });
      }

      await prisma.product.delete({
        where: { id },
      });

      return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Delete product error:', error);

      // Handle "record not found" specifically (Prisma P2025)
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Product not found' });
      }

      return res.status(500).json({ error: 'Internal server error' });
    }

  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAdmin(handler);