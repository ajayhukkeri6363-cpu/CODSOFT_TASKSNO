import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function seedDatabase(force = false) {
  try {
    const existingUsers = await prisma.user.count();
    const existingCategories = await prisma.menuCategory.count();
    const existingItems = await prisma.menuItem.count();
    const existingTables = await prisma.restaurantTable.count();

    if (!force && existingUsers >= 3 && existingCategories >= 6 && existingItems >= 15 && existingTables >= 10) {
      return {
        seeded: false,
        message: 'Database already fully populated',
        counts: {
          users: existingUsers,
          categories: existingCategories,
          menuItems: existingItems,
          tables: existingTables,
        },
      };
    }

    if (force) {
      await prisma.payment.deleteMany().catch(() => {});
      await prisma.orderItem.deleteMany().catch(() => {});
      await prisma.order.deleteMany().catch(() => {});
      await prisma.reservation.deleteMany().catch(() => {});
      await prisma.restaurantTable.deleteMany().catch(() => {});
      await prisma.menuItem.deleteMany().catch(() => {});
      await prisma.menuCategory.deleteMany().catch(() => {});
      await prisma.user.deleteMany().catch(() => {});
    }

    const adminPassword = await bcrypt.hash('admin123', 10);
    const staffPassword = await bcrypt.hash('staff123', 10);
    const customerPassword = await bcrypt.hash('customer123', 10);

    // 1. Create Users
    await prisma.user.upsert({
      where: { email: 'admin@dinedesk.com' },
      update: {
        passwordHash: adminPassword,
        role: 'ADMIN',
        name: 'Chef Alessandro Rossi',
      },
      create: {
        email: 'admin@dinedesk.com',
        passwordHash: adminPassword,
        role: 'ADMIN',
        name: 'Chef Alessandro Rossi',
        phone: '+1 (555) 782-9001',
        avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&auto=format&fit=crop&q=80',
      },
    });

    await prisma.user.upsert({
      where: { email: 'chef.marco@dinedesk.com' },
      update: {
        passwordHash: staffPassword,
        role: 'STAFF',
        name: 'Marco Bellini (Head Chef)',
      },
      create: {
        email: 'chef.marco@dinedesk.com',
        passwordHash: staffPassword,
        role: 'STAFF',
        name: 'Marco Bellini (Head Chef)',
        phone: '+1 (555) 782-9002',
        avatar: 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=200&auto=format&fit=crop&q=80',
      },
    });

    await prisma.user.upsert({
      where: { email: 'waiter.lucas@dinedesk.com' },
      update: {
        passwordHash: staffPassword,
        role: 'STAFF',
        name: 'Lucas Silva (Floor Lead)',
      },
      create: {
        email: 'waiter.lucas@dinedesk.com',
        passwordHash: staffPassword,
        role: 'STAFF',
        name: 'Lucas Silva (Floor Lead)',
        phone: '+1 (555) 782-9003',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      },
    });

    await prisma.user.upsert({
      where: { email: 'sophia.miller@example.com' },
      update: {
        passwordHash: customerPassword,
        role: 'CUSTOMER',
        name: 'Sophia Miller',
      },
      create: {
        email: 'sophia.miller@example.com',
        passwordHash: customerPassword,
        role: 'CUSTOMER',
        name: 'Sophia Miller',
        phone: '+1 (555) 912-3456',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      },
    });

    await prisma.user.upsert({
      where: { email: 'ethan.hunt@example.com' },
      update: {
        passwordHash: customerPassword,
        role: 'CUSTOMER',
        name: 'Ethan Hunt',
      },
      create: {
        email: 'ethan.hunt@example.com',
        passwordHash: customerPassword,
        role: 'CUSTOMER',
        name: 'Ethan Hunt',
        phone: '+1 (555) 823-4567',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      },
    });

    await prisma.user.upsert({
      where: { email: 'olivia.davis@example.com' },
      update: {
        passwordHash: customerPassword,
        role: 'CUSTOMER',
        name: 'Olivia Davis',
      },
      create: {
        email: 'olivia.davis@example.com',
        passwordHash: customerPassword,
        role: 'CUSTOMER',
        name: 'Olivia Davis',
        phone: '+1 (555) 634-5678',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
      },
    });

    // 2. Create Categories
    const categoriesData = [
      { name: 'Artisanal Starters', slug: 'starters', description: 'Handcrafted appetizers, crispy bites, and gourmet boards.', icon: 'Soup', displayOrder: 1 },
      { name: 'Stone-Oven Pizzas', slug: 'pizzas', description: '48-hour fermented sourdough fired in our 800°F stone oven.', icon: 'Pizza', displayOrder: 2 },
      { name: 'Handcrafted Pastas', slug: 'pastas', description: 'Freshly rolled bronze-die pasta with slow-simmered regional sauces.', icon: 'UtensilsCrossed', displayOrder: 3 },
      { name: 'Prime Grill & Mains', slug: 'mains', description: 'Wood-fired prime cuts, seared seafood, and seasonal creations.', icon: 'Flame', displayOrder: 4 },
      { name: 'Decadent Desserts', slug: 'desserts', description: 'Pastry chef specials, rich mousses, and artisanal gelatos.', icon: 'Cake', displayOrder: 5 },
      { name: 'Signature Beverages', slug: 'beverages', description: 'Craft mocktails, cold brews, artisanal sodas, and fresh infusions.', icon: 'GlassWater', displayOrder: 6 },
    ];

    const categoryMap: Record<string, string> = {};
    for (const cat of categoriesData) {
      const created = await prisma.menuCategory.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          description: cat.description,
          icon: cat.icon,
          displayOrder: cat.displayOrder,
          isActive: true,
        },
        create: cat,
      });
      categoryMap[cat.slug] = created.id;
    }

    // 3. Create Menu Items
    const menuItemsData = [
      {
        categoryId: categoryMap['starters'],
        name: 'Truffle Burrata & Heirloom Bruschetta',
        slug: 'truffle-burrata-bruschetta',
        description: 'Creamy Pugliese burrata, heirloom cherry tomatoes, cold-pressed basil oil, 12-year balsamic glaze on toasted ciabatta.',
        price: 16.50,
        image: 'https://images.unsplash.com/photo-1592417817098-8f3d69106093?w=600&auto=format&fit=crop&q=80',
        isVeg: true,
        isGlutenFree: false,
        isSpicy: false,
        isPopular: true,
        isAvailable: true,
        prepTimeMinutes: 12,
        calories: 420,
        ingredients: 'Burrata cheese, Heirloom tomatoes, Ciabatta bread, Basil, Extra virgin olive oil, Balsamic reduction',
      },
      {
        categoryId: categoryMap['starters'],
        name: 'Crispy Calamari Fritti',
        slug: 'crispy-calamari-fritti',
        description: 'Tender Monterey squid tossed in seasoned semolina, flash-fried with grilled Meyer lemon and spicy Calabrian chili aioli.',
        price: 18.00,
        image: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=600&auto=format&fit=crop&q=80',
        isVeg: false,
        isGlutenFree: false,
        isSpicy: true,
        isPopular: true,
        isAvailable: true,
        prepTimeMinutes: 14,
        calories: 510,
        ingredients: 'Calamari, Semolina crust, Meyer lemon, Garlic aioli, Calabrian chili paste, Fresh parsley',
      },
      {
        categoryId: categoryMap['starters'],
        name: 'Wild Forest Mushroom Arancini',
        slug: 'wild-mushroom-arancini',
        description: 'Crispy risotto spheres stuffed with porcini mushrooms, fontina cheese center, served over roasted garlic truffle fondue.',
        price: 15.00,
        image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=600&auto=format&fit=crop&q=80',
        isVeg: true,
        isGlutenFree: false,
        isSpicy: false,
        isPopular: false,
        isAvailable: true,
        prepTimeMinutes: 15,
        calories: 480,
        ingredients: 'Arborio rice, Porcini mushrooms, Fontina cheese, Panko breadcrumbs, Truffle cream',
      },
      {
        categoryId: categoryMap['pizzas'],
        name: 'Margherita D.O.P. di Bufala',
        slug: 'margherita-dop-di-bufala',
        description: 'San Marzano D.O.P. tomato sauce, fresh buffalo mozzarella, fragrant sweet basil, sea salt, and extra virgin olive oil.',
        price: 21.00,
        image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80',
        isVeg: true,
        isGlutenFree: false,
        isSpicy: false,
        isPopular: true,
        isAvailable: true,
        prepTimeMinutes: 16,
        calories: 780,
        ingredients: '48-hr fermented dough, San Marzano tomatoes, Buffalo mozzarella, Fresh basil leaves, Olive oil',
      },
      {
        categoryId: categoryMap['pizzas'],
        name: 'Spicy Diavola & Hot Honey',
        slug: 'spicy-diavola-hot-honey',
        description: 'Artisanal Calabrese salami, spicy nduja paste, smoked provolone, pickled red Fresno chilies, drizzled with habanero hot honey.',
        price: 24.50,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
        isVeg: false,
        isGlutenFree: false,
        isSpicy: true,
        isPopular: true,
        isAvailable: true,
        prepTimeMinutes: 18,
        calories: 890,
        ingredients: 'Sourdough crust, Calabrese salami, Nduja sausage, Provolone, Fresno peppers, Hot honey drizzle',
      },
      {
        categoryId: categoryMap['pizzas'],
        name: 'Tartufo Nero & Wild Mushroom',
        slug: 'tartufo-nero-wild-mushroom',
        description: 'Black truffle cream base, roasted wild chanterelles, fior di latte, aged pecorino romano, and fresh thyme.',
        price: 26.00,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80',
        isVeg: true,
        isGlutenFree: false,
        isSpicy: false,
        isPopular: false,
        isAvailable: true,
        prepTimeMinutes: 18,
        calories: 820,
        ingredients: 'Black truffle cream, Chanterelle mushrooms, Fior di latte, Pecorino Romano, Fresh thyme',
      },
      {
        categoryId: categoryMap['pastas'],
        name: 'Handcrafted Tagliatelle al Tartufo',
        slug: 'tagliatelle-al-tartufo',
        description: 'Egg tagliatelle rolled in-house, tossed in cultured French butter, 24-month Parmigiano-Reggiano, and shaved Norcia black truffle.',
        price: 28.00,
        image: 'https://images.unsplash.com/photo-1621996346565-e3d5d62817d2?w=600&auto=format&fit=crop&q=80',
        isVeg: true,
        isGlutenFree: false,
        isSpicy: false,
        isPopular: true,
        isAvailable: true,
        prepTimeMinutes: 16,
        calories: 640,
        ingredients: 'Fresh egg tagliatelle, Cultured butter, Parmigiano-Reggiano, Black truffle shavings',
      },
      {
        categoryId: categoryMap['pastas'],
        name: 'Slow-Braised Short Rib Pappardelle',
        slug: 'short-rib-pappardelle',
        description: 'Wide ribbon pappardelle with 8-hour braised Angus beef short rib ragù, rosemary, San Marzano tomato reduction, and whipped ricotta.',
        price: 27.50,
        image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80',
        isVeg: false,
        isGlutenFree: false,
        isSpicy: false,
        isPopular: true,
        isAvailable: true,
        prepTimeMinutes: 18,
        calories: 760,
        ingredients: 'Pappardelle pasta, Angus beef short rib, Chianti red wine, Mirepoix, Whipped whole milk ricotta',
      },
      {
        categoryId: categoryMap['pastas'],
        name: 'Spaghetti ai Frutti di Mare',
        slug: 'spaghetti-frutti-di-mare',
        description: 'Extruded durum wheat spaghetti with jumbo prawns, Manila clams, PEI mussels, white wine, garlic, cherry tomatoes, and red chili flakes.',
        price: 29.00,
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
        isVeg: false,
        isGlutenFree: false,
        isSpicy: true,
        isPopular: false,
        isAvailable: true,
        prepTimeMinutes: 20,
        calories: 610,
        ingredients: 'Spaghetti, Gulf tiger prawns, Manila clams, Mussels, White wine broth, Garlic, Parsley',
      },
      {
        categoryId: categoryMap['mains'],
        name: 'Wood-Fired Prime Ribeye Steak (14oz)',
        slug: 'prime-ribeye-steak',
        description: 'USDA Prime dry-aged 28 days, grilled over red oak, served with bone marrow roasted garlic butter and crispy duck fat potatoes.',
        price: 46.00,
        image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&auto=format&fit=crop&q=80',
        isVeg: false,
        isGlutenFree: true,
        isSpicy: false,
        isPopular: true,
        isAvailable: true,
        prepTimeMinutes: 24,
        calories: 950,
        ingredients: 'USDA Prime ribeye, Bone marrow compound butter, Fingerling potatoes, Rosemary, Sea salt flakes',
      },
      {
        categoryId: categoryMap['mains'],
        name: 'Pan-Roasted Chilean Sea Bass',
        slug: 'pan-roasted-chilean-sea-bass',
        description: 'Sustainably caught sea bass fillet, saffron cauliflower silk, baby leeks, crispy capers, and citrus-caper emulsion.',
        price: 42.00,
        image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80',
        isVeg: false,
        isGlutenFree: true,
        isSpicy: false,
        isPopular: false,
        isAvailable: true,
        prepTimeMinutes: 22,
        calories: 580,
        ingredients: 'Chilean sea bass, Saffron puree, Baby leeks, Crispy capers, Lemon beurre blanc',
      },
      {
        categoryId: categoryMap['mains'],
        name: 'Roasted Herb Butter Half Chicken',
        slug: 'roasted-herb-half-chicken',
        description: 'Organic free-range chicken roasted with garlic herb butter, charred broccolini, creamy Yukon gold potato puree, and pan jus.',
        price: 31.00,
        image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&auto=format&fit=crop&q=80',
        isVeg: false,
        isGlutenFree: true,
        isSpicy: false,
        isPopular: false,
        isAvailable: true,
        prepTimeMinutes: 20,
        calories: 720,
        ingredients: 'Organic chicken, Garlic herb butter, Charred broccolini, Yukon Gold potatoes, Natural pan reduction',
      },
      {
        categoryId: categoryMap['desserts'],
        name: 'Classic Venetian Tiramisù al Mascarpone',
        slug: 'venetian-tiramisu',
        description: 'Savoiardi ladyfingers steeped in Illy espresso & Marsala wine, layered with fluffy mascarpone cream and Valrhona cocoa.',
        price: 12.50,
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80',
        isVeg: true,
        isGlutenFree: false,
        isSpicy: false,
        isPopular: true,
        isAvailable: true,
        prepTimeMinutes: 8,
        calories: 450,
        ingredients: 'Savoiardi biscuits, Illy espresso, Mascarpone cheese, Farm egg yolks, Valrhona dark cocoa',
      },
      {
        categoryId: categoryMap['desserts'],
        name: 'Molten Belgian Chocolate Lava Cake',
        slug: 'chocolate-lava-cake',
        description: 'Warm 70% dark chocolate souffle cake with a molten center, served with house-spun Tahitian vanilla bean gelato and raspberry coulis.',
        price: 14.00,
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
        isVeg: true,
        isGlutenFree: false,
        isSpicy: false,
        isPopular: true,
        isAvailable: true,
        prepTimeMinutes: 14,
        calories: 590,
        ingredients: '70% Belgian chocolate, Butter, Eggs, Vanilla gelato, Raspberry coulis',
      },
      {
        categoryId: categoryMap['desserts'],
        name: 'Sicilian Pistachio Panna Cotta',
        slug: 'sicilian-pistachio-panna-cotta',
        description: 'Silky cream infused with Bronte pistachio paste, layered with roasted crushed pistachios and pomegranate reduction.',
        price: 13.00,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        isVeg: true,
        isGlutenFree: true,
        isSpicy: false,
        isPopular: false,
        isAvailable: true,
        prepTimeMinutes: 8,
        calories: 380,
        ingredients: 'Fresh heavy cream, Bronte pistachios, Gelatin, Pomegranate seeds, Wild honey',
      },
      {
        categoryId: categoryMap['beverages'],
        name: 'Smoked Rosemary Citrus Mocktail',
        slug: 'smoked-rosemary-citrus-mocktail',
        description: 'Blood orange juice, fresh yuzu, agave nectar, sparkling San Pellegrino, torched rosemary sprig, served over crystal ice rock.',
        price: 9.50,
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
        isVeg: true,
        isGlutenFree: true,
        isSpicy: false,
        isPopular: true,
        isAvailable: true,
        prepTimeMinutes: 6,
        calories: 140,
        ingredients: 'Blood orange juice, Yuzu puree, Agave nectar, Torched fresh rosemary, Sparkling water',
      },
      {
        categoryId: categoryMap['beverages'],
        name: 'Passionfruit Ginger Fizz',
        slug: 'passionfruit-ginger-fizz',
        description: 'Tropical passionfruit pulp, cold-pressed spicy ginger juice, mint leaves, lime juice, and artisanal tonic.',
        price: 8.50,
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
        isVeg: true,
        isGlutenFree: true,
        isSpicy: true,
        isPopular: false,
        isAvailable: true,
        prepTimeMinutes: 6,
        calories: 120,
        ingredients: 'Passionfruit, Fresh ginger juice, Mint, Lime, Tonic water',
      },
      {
        categoryId: categoryMap['beverages'],
        name: 'Cold Drip Nitro Reserve Coffee',
        slug: 'nitro-cold-brew-coffee',
        description: '18-hour slow-steeped Ethiopian single-origin beans infused with nitrogen for a velvety micro-foam head and chocolate notes.',
        price: 7.00,
        image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
        isVeg: true,
        isGlutenFree: true,
        isSpicy: false,
        isPopular: false,
        isAvailable: true,
        prepTimeMinutes: 4,
        calories: 10,
        ingredients: 'Ethiopian Yirgacheffe coffee beans, Triple-filtered water, Pure nitrogen gas',
      },
    ];

    for (const item of menuItemsData) {
      if (!item.categoryId) {
        const firstCat = await prisma.menuCategory.findFirst();
        if (firstCat) item.categoryId = firstCat.id;
      }
      await prisma.menuItem.upsert({
        where: { slug: item.slug },
        update: {
          price: item.price,
          image: item.image,
          isAvailable: true,
          isPopular: item.isPopular,
          isVeg: item.isVeg,
          isGlutenFree: item.isGlutenFree,
          isSpicy: item.isSpicy,
        },
        create: item,
      });
    }

    // 4. Create Tables
    const tablesData = [
      { tableNumber: 'Table 1', capacity: 2, location: 'WINDOW_SIDE', status: 'AVAILABLE' },
      { tableNumber: 'Table 2', capacity: 2, location: 'WINDOW_SIDE', status: 'OCCUPIED' },
      { tableNumber: 'Table 3', capacity: 4, location: 'MAIN_HALL', status: 'AVAILABLE' },
      { tableNumber: 'Table 4', capacity: 4, location: 'MAIN_HALL', status: 'AVAILABLE' },
      { tableNumber: 'Table 5', capacity: 6, location: 'MAIN_HALL', status: 'OCCUPIED' },
      { tableNumber: 'Table 6', capacity: 4, location: 'PATIO', status: 'RESERVED' },
      { tableNumber: 'Table 7', capacity: 4, location: 'PATIO', status: 'AVAILABLE' },
      { tableNumber: 'Table 8', capacity: 8, location: 'VIP_LOUNGE', status: 'AVAILABLE' },
      { tableNumber: 'Table 9', capacity: 10, location: 'VIP_LOUNGE', status: 'AVAILABLE' },
      { tableNumber: 'Table 10', capacity: 4, location: 'ROOFTOP', status: 'CLEANING' },
    ];

    for (const t of tablesData) {
      await prisma.restaurantTable.upsert({
        where: { tableNumber: t.tableNumber },
        update: {
          capacity: t.capacity,
          location: t.location,
        },
        create: t,
      });
    }

    const userCount = await prisma.user.count();
    const categoryCount = await prisma.menuCategory.count();
    const itemCount = await prisma.menuItem.count();
    const tableCount = await prisma.restaurantTable.count();

    return {
      seeded: true,
      message: 'DineDesk database seeded successfully',
      counts: { users: userCount, categories: categoryCount, menuItems: itemCount, tables: tableCount },
    };
  } catch (error: any) {
    console.error('Seed database error:', error);
    throw error;
  }
}

let seedPromise: Promise<any> | null = null;

export async function seedDatabaseIfEmpty() {
  try {
    const categoriesCount = await prisma.menuCategory.count();
    const itemsCount = await prisma.menuItem.count();
    const usersCount = await prisma.user.count();
    const tablesCount = await prisma.restaurantTable.count();

    if (categoriesCount < 6 || itemsCount < 15 || usersCount < 3 || tablesCount < 10) {
      if (!seedPromise) {
        seedPromise = seedDatabase(false).finally(() => {
          seedPromise = null;
        });
      }
      return await seedPromise;
    }
  } catch (error) {
    console.error('Error during auto-seed check:', error);
  }
}
