import { Router } from 'express';
import { Sweet, InventoryTransaction, AuditLog } from '../models';
import { cloudinaryService } from '../services';
import { 
  verifyAccessToken, 
  requireRole, 
  asyncHandler, 
  AuthRequest,
  validateBody,
  validateQuery,
  createError
} from '../middleware';
import { 
  createSweetSchema, 
  updateSweetSchema, 
  searchSweetsSchema,
  restockSchema 
} from '../utils/validationSchemas';
import multer from 'multer';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// GET /api/sweets/categories - Get all unique categories
router.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const categories = await Sweet.distinct('category', { isActive: true });
    
    res.json({
      success: true,
      data: categories.sort(),
    });
  })
);

// GET /api/sweets/admin/all - Get all sweets including inactive (admin only)
router.get(
  '/admin/all',
  verifyAccessToken,
  requireRole(['admin']),
  asyncHandler(async (_req, res) => {
    const sweets = await Sweet.find()
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: sweets,
    });
  })
);

// GET /api/sweets - Get all active sweets
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const sweets = await Sweet.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      data: sweets,
    });
  })
);

// GET /api/sweets/search - Search and filter sweets
router.get(
  '/search',
  validateQuery(searchSweetsSchema),
  asyncHandler(async (req, res) => {
    const { name, category, minPrice, maxPrice, sort, page, limit } = req.query as any;
    
    const query: Record<string, unknown> = { isActive: true };
    
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) (query.price as any).$gte = minPrice;
      if (maxPrice !== undefined) (query.price as any).$lte = maxPrice;
    }
    
    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    switch (sort) {
      case 'price_asc': sortOption = { price: 1 }; break;
      case 'price_desc': sortOption = { price: -1 }; break;
      case 'name_asc': sortOption = { name: 1 }; break;
      case 'name_desc': sortOption = { name: -1 }; break;
      case 'newest': sortOption = { createdAt: -1 }; break;
    }
    
    const skip = (page - 1) * limit;
    
    const [sweets, total] = await Promise.all([
      Sweet.find(query).sort(sortOption).skip(skip).limit(limit),
      Sweet.countDocuments(query),
    ]);
    
    res.json({
      success: true,
      data: sweets,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    });
  })
);

// GET /api/sweets/:id - Get single sweet
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const sweet = await Sweet.findById(req.params.id);
    
    if (!sweet) {
      throw createError('Sweet not found', 404);
    }
    
    res.json({
      success: true,
      data: sweet,
    });
  })
);

// POST /api/sweets - Create sweet (admin only)
router.post(
  '/',
  verifyAccessToken,
  requireRole(['admin']),
  upload.single('image'),
  validateBody(createSweetSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const { name, category, description, price, quantity } = req.body;
    
    let imageUrl: string | undefined;
    
    if (req.file) {
      const result = await cloudinaryService.uploadImage(req.file.buffer, 'sweets');
      imageUrl = result.url;
    }
    
    const sweet = await Sweet.create({
      name,
      category,
      description,
      price,
      quantity: quantity || 0,
      imageUrl,
    });
    
    // Create audit log
    await AuditLog.create({
      actorUserId: req.user!._id,
      action: 'create',
      resourceType: 'sweet',
      resourceId: sweet._id,
      after: sweet.toObject(),
    });
    
    res.status(201).json({
      success: true,
      message: 'Sweet created successfully',
      data: sweet,
    });
  })
);

// PUT /api/sweets/:id - Update sweet (admin only)
router.put(
  '/:id',
  verifyAccessToken,
  requireRole(['admin']),
  upload.single('image'),
  validateBody(updateSweetSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const sweet = await Sweet.findById(req.params.id);
    
    if (!sweet) {
      throw createError('Sweet not found', 404);
    }
    
    const before = sweet.toObject();
    
    // Update fields
    Object.assign(sweet, req.body);
    
    if (req.file) {
      const result = await cloudinaryService.uploadImage(req.file.buffer, 'sweets');
      sweet.imageUrl = result.url;
    }
    
    await sweet.save();
    
    // Create audit log
    await AuditLog.create({
      actorUserId: req.user!._id,
      action: 'update',
      resourceType: 'sweet',
      resourceId: sweet._id,
      before,
      after: sweet.toObject(),
    });
    
    res.json({
      success: true,
      message: 'Sweet updated successfully',
      data: sweet,
    });
  })
);

// DELETE /api/sweets/:id - Delete sweet (admin only)
router.delete(
  '/:id',
  verifyAccessToken,
  requireRole(['admin']),
  asyncHandler(async (req: AuthRequest, res) => {
    const sweet = await Sweet.findById(req.params.id);
    
    if (!sweet) {
      throw createError('Sweet not found', 404);
    }
    
    const before = sweet.toObject();
    
    // Hard delete - permanently remove from database
    await Sweet.findByIdAndDelete(req.params.id);
    
    // Create audit log
    await AuditLog.create({
      actorUserId: req.user!._id,
      action: 'delete',
      resourceType: 'sweet',
      resourceId: sweet._id,
      before,
    });
    
    res.json({
      success: true,
      message: 'Sweet deleted successfully',
    });
  })
);

// POST /api/sweets/:id/restock - Restock sweet (admin only)
router.post(
  '/:id/restock',
  verifyAccessToken,
  requireRole(['admin']),
  validateBody(restockSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const { quantity, note } = req.body;
    
    const sweet = await Sweet.findByIdAndUpdate(
      req.params.id,
      { $inc: { quantity } },
      { new: true }
    );
    
    if (!sweet) {
      throw createError('Sweet not found', 404);
    }
    
    // Record inventory transaction
    await InventoryTransaction.create({
      sweetId: sweet._id,
      userId: req.user!._id,
      type: 'restock',
      quantityChange: quantity,
      note,
    });
    
    // Create audit log
    await AuditLog.create({
      actorUserId: req.user!._id,
      action: 'restock',
      resourceType: 'inventory',
      resourceId: sweet._id,
      after: { quantity: sweet.quantity, added: quantity },
    });
    
    res.json({
      success: true,
      message: 'Sweet restocked successfully',
      data: sweet,
    });
  })
);

// POST /api/sweets/:id/review - Add review to sweet (requires delivered order)
router.post(
  '/:id/review',
  verifyAccessToken,
  asyncHandler(async (req: AuthRequest, res) => {
    const { rating, comment } = req.body;
    const sweetId = req.params.id;
    const userId = req.user!._id;
    const userName = req.user!.name;
    
    if (!rating || rating < 1 || rating > 5) {
      throw createError('Rating must be between 1 and 5', 400);
    }
    
    if (!comment || comment.trim().length === 0) {
      throw createError('Comment is required', 400);
    }
    
    if (comment.length > 500) {
      throw createError('Comment cannot exceed 500 characters', 400);
    }
    
    // Check if user has a delivered order with this sweet
    const { Order } = await import('../models');
    const deliveredOrder = await Order.findOne({
      userId,
      status: 'delivered',
      'items.sweetId': sweetId,
    });
    
    if (!deliveredOrder) {
      throw createError('You can only review sweets from delivered orders', 403);
    }
    
    const sweet = await Sweet.findById(sweetId);
    if (!sweet) {
      throw createError('Sweet not found', 404);
    }
    
    // Check if user already reviewed
    const existingReview = sweet.reviews.find(
      (r) => r.userId.toString() === userId.toString()
    );
    
    if (existingReview) {
      throw createError('You have already reviewed this sweet', 400);
    }
    
    // Add review
    sweet.reviews.push({
      userId,
      userName,
      rating,
      comment: comment.trim(),
      createdAt: new Date(),
    });
    
    // Calculate average rating
    const totalRating = sweet.reviews.reduce((sum, r) => sum + r.rating, 0);
    sweet.averageRating = totalRating / sweet.reviews.length;
    sweet.totalReviews = sweet.reviews.length;
    
    await sweet.save();
    
    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: {
        review: sweet.reviews[sweet.reviews.length - 1],
        averageRating: sweet.averageRating,
        totalReviews: sweet.totalReviews,
      },
    });
  })
);

// GET /api/sweets/:id/reviews - Get all reviews for a sweet
router.get(
  '/:id/reviews',
  asyncHandler(async (req, res) => {
    const sweet = await Sweet.findById(req.params.id).select('reviews averageRating totalReviews name');
    
    if (!sweet) {
      throw createError('Sweet not found', 404);
    }
    
    res.json({
      success: true,
      data: {
        sweetName: sweet.name,
        averageRating: sweet.averageRating,
        totalReviews: sweet.totalReviews,
        reviews: sweet.reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
      },
    });
  })
);

export default router;
