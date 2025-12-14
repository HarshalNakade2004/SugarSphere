import { Sweet } from '../../models/Sweet';

describe('Sweet Model', () => {
  describe('Sweet Creation', () => {
    it('should create a sweet with valid data', async () => {
      const sweetData = {
        name: 'Gulab Jamun',
        category: 'Indian',
        description: 'Delicious milk-solid based sweet',
        price: 250,
        quantity: 100,
      };

      const sweet = await Sweet.create(sweetData);

      expect(sweet).toBeDefined();
      expect(sweet.name).toBe(sweetData.name);
      expect(sweet.category).toBe(sweetData.category);
      expect(sweet.price).toBe(sweetData.price);
      expect(sweet.quantity).toBe(sweetData.quantity);
      expect(sweet.isActive).toBe(true); // default
    });

    it('should fail without required fields', async () => {
      await expect(Sweet.create({})).rejects.toThrow();
    });

    it('should fail with negative price', async () => {
      await expect(
        Sweet.create({
          name: 'Test Sweet',
          category: 'Indian',
          description: 'Test description',
          price: -100,
          quantity: 10,
        })
      ).rejects.toThrow();
    });

    it('should fail with negative quantity', async () => {
      await expect(
        Sweet.create({
          name: 'Test Sweet',
          category: 'Indian',
          description: 'Test description',
          price: 100,
          quantity: -10,
        })
      ).rejects.toThrow();
    });

    it('should allow creating with image URL', async () => {
      const sweet = await Sweet.create({
        name: 'Laddu',
        category: 'Indian',
        description: 'Traditional round sweet',
        price: 200,
        quantity: 50,
        imageUrl: 'https://example.com/laddu.jpg',
      });

      expect(sweet.imageUrl).toBe('https://example.com/laddu.jpg');
    });
  });

  describe('Sweet Reviews', () => {
    it('should initialize with empty reviews', async () => {
      const sweet = await Sweet.create({
        name: 'Barfi',
        category: 'Indian',
        description: 'Milk-based sweet',
        price: 300,
        quantity: 25,
      });

      expect(sweet.reviews).toBeDefined();
      expect(sweet.reviews.length).toBe(0);
      expect(sweet.averageRating).toBe(0);
      expect(sweet.totalReviews).toBe(0);
    });
  });

  describe('Sweet Active Status', () => {
    it('should default to active', async () => {
      const sweet = await Sweet.create({
        name: 'Peda',
        category: 'Indian',
        description: 'Soft milk sweet',
        price: 180,
        quantity: 40,
      });

      expect(sweet.isActive).toBe(true);
    });

    it('should allow setting inactive', async () => {
      const sweet = await Sweet.create({
        name: 'Rasmalai',
        category: 'Indian',
        description: 'Cheese patties in sweet milk',
        price: 350,
        quantity: 30,
        isActive: false,
      });

      expect(sweet.isActive).toBe(false);
    });
  });

  describe('Sweet Query Methods', () => {
    beforeEach(async () => {
      await Sweet.create([
        {
          name: 'Gulab Jamun',
          category: 'Indian',
          description: 'Delicious sweet',
          price: 250,
          quantity: 100,
          isActive: true,
        },
        {
          name: 'Chocolate Cake',
          category: 'Cakes',
          description: 'Rich chocolate cake',
          price: 500,
          quantity: 0,
          isActive: true,
        },
        {
          name: 'Old Sweet',
          category: 'Indian',
          description: 'Discontinued',
          price: 100,
          quantity: 50,
          isActive: false,
        },
      ]);
    });

    it('should find active sweets only', async () => {
      const activeSweets = await Sweet.find({ isActive: true });
      expect(activeSweets.length).toBe(2);
    });

    it('should find sweets by category', async () => {
      const indianSweets = await Sweet.find({ category: 'Indian', isActive: true });
      expect(indianSweets.length).toBe(1);
      expect(indianSweets[0].name).toBe('Gulab Jamun');
    });

    it('should find sweets with quantity > 0', async () => {
      const inStockSweets = await Sweet.find({ quantity: { $gt: 0 }, isActive: true });
      expect(inStockSweets.length).toBe(1);
      expect(inStockSweets[0].name).toBe('Gulab Jamun');
    });
  });
});
