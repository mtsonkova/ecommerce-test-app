import { prisma } from '../../../../lib/prisma';
import { requireAdmin } from '../../../../lib/auth';

async function handler(req, res) {
  if (req.method === 'POST') {
    // Create new category
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Category name is required' });
      }

      const category = await prisma.category.create({
        data: {
          name,
          description,
        },
      });

      res.status(201).json({
        message: 'Category created successfully',
        category,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Category already exists' });
      }
      console.error('Create category error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'GET') {
    // Get all categories
    try {
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: { name: 'asc' },
      });

      res.status(200).json({ categories });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAdmin(handler);
