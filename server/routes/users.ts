import { Router, Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middleware/auth';
import { seedDatabase } from '../utils/seedData';

const router = Router();

// Get authenticated user's profile
router.get('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.userProfile.findUnique({ where: { uid } });
    if (!user) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(user);
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create/Update user profile
router.post('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const { email, name, roles, unitId, companyId } = req.body;
    await prisma.userProfile.upsert({
      where: { uid },
      update: { email, name, roles, unitId, companyId },
      create: { uid, email, name, roles, unitId, companyId },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new company
router.post('/company', async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const { name, address, phone, email, logoUrl } = req.body;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const company = await prisma.company.create({
      data: {
        name,
        code,
        address,
        phone,
        email,
        logoUrl,
        ownerId: uid,
      }
    });
    
    // Seed database for new company
    await seedDatabase(company.id);

    res.json(company);
  } catch (error: any) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: error.message });
  }
});

// Find company by code
router.get('/company/code/:code', async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.params;
    const company = await prisma.company.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(company);
  } catch (error: any) {
    console.error('Error finding company:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all users for a company
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'User has no companyId' });
    }

    const users = await prisma.userProfile.findMany({
      where: { companyId },
      orderBy: { name: 'asc' }
    });
    res.json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user roles
router.patch('/:uid/roles', async (req: AuthRequest, res: Response) => {
  try {
    const { uid } = req.params;
    const { roles } = req.body;
    const companyId = req.user?.companyId;

    // Security check: ensure user is admin of the same company
    if (!req.user?.roles.includes('admin')) {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }

    const user = await prisma.userProfile.findUnique({ where: { uid } });
    if (!user || user.companyId !== companyId) {
      return res.status(403).json({ error: 'Forbidden: User not in your company' });
    }

    await prisma.userProfile.update({
      where: { uid },
      data: { roles }
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating user roles:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get company details
router.get('/company/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({ where: { id } });
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(company);
  } catch (error: any) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update company details
router.put('/company/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    const roles = req.user?.roles || [];

    // Security check: ensure user is admin of the company
    if (id !== companyId || !roles.includes('admin')) {
      return res.status(403).json({ error: 'Forbidden: Admins of the company only' });
    }

    const companyData = req.body;
    // Remove sensitive fields if any
    delete companyData.id;
    delete companyData.code;
    delete companyData.ownerId;
    delete companyData.createdAt;
    delete companyData.companyId; // Should not be there anyway

    await prisma.company.update({
      where: { id },
      data: {
        ...companyData,
      }
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: error.message });
  }
});

// Seed database for a company
router.post('/company/:id/seed', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    const roles = req.user?.roles || [];

    // Security check: ensure user is admin of the company
    if (id !== companyId || !roles.includes('admin')) {
      return res.status(403).json({ error: 'Forbidden: Admins of the company only' });
    }

    await seedDatabase(id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error seeding company data:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
