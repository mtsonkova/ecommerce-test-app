import { prisma } from '../../../../../lib/prisma';
import { requireAdmin } from '../../../../../lib/auth';

async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    // Update category
    try {
      const { name, description } = req.body;

      const category = await prisma.category.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
        },
      });

      res.status(200).json({
        message: 'Category updated successfully',
        category,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Category name already exists' });
      }
      console.error('Update category error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    // Delete category
    try {
      // Check if category has products
      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });

      if (category._count.products > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete category with existing products' 
        });
      }

      await prisma.category.delete({
        where: { id },
      });

      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAdmin(handler);
