const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🍽️ Seeding DineDesk Restaurant Ordering & Table Management Platform...');

  // Clean existing tables (in reverse relation order)
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.restaurantTable.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash('admin123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  // 1. Create Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@dinedesk.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      name: 'Chef Alessandro Rossi',
      phone: '+1 (555) 782-9001',
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&auto=format&fit=crop&q=80',
    },
  });

  const staffChef = await prisma.user.create({
    data: {
      email: 'chef.marco@dinedesk.com',
      passwordHash: staffPassword,
      role: 'STAFF',
      name: 'Marco Bellini (Head Chef)',
      phone: '+1 (555) 782-9002',
      avatar: 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=200&auto=format&fit=crop&q=80',
    },
  });

  const staffFloor = await prisma.user.create({
    data: {
      email: 'waiter.lucas@dinedesk.com',
      passwordHash: staffPassword,
      role: 'STAFF',
      name: 'Lucas Silva (Floor Lead)',
      phone: '+1 (555) 782-9003',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: 'sophia.miller@example.com',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      name: 'Sophia Miller',
      phone: '+1 (555) 912-3456',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'ethan.hunt@example.com',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      name: 'Ethan Hunt',
      phone: '+1 (555) 823-4567',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      email: 'olivia.davis@example.com',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      name: 'Olivia Davis',
      phone: '+1 (555) 634-5678',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    },
  });

  console.log('✅ Created Admin, Staff, and Customer users.');

  // 2. Create Menu Categories
  const catStarters = await prisma.menuCategory.create({
    data: {
      name: 'Artisanal Starters',
      slug: 'starters',
      description: 'Handcrafted appetizers, crispy bites, and gourmet boards.',
      icon: 'Soup',
      displayOrder: 1,
    },
  });

  const catPizzas = await prisma.menuCategory.create({
    data: {
      name: 'Stone-Oven Pizzas',
      slug: 'pizzas',
      description: '48-hour fermented sourdough fired in our 800°F stone oven.',
      icon: 'Pizza',
      displayOrder: 2,
    },
  });

  const catPastas = await prisma.menuCategory.create({
    data: {
      name: 'Handcrafted Pastas',
      slug: 'pastas',
      description: 'Freshly rolled bronze-die pasta with slow-simmered regional sauces.',
      icon: 'UtensilsCrossed',
      displayOrder: 3,
    },
  });

  const catMains = await prisma.menuCategory.create({
    data: {
      name: 'Prime Grill & Mains',
      slug: 'mains',
      description: 'Wood-fired prime cuts, seared seafood, and seasonal creations.',
      icon: 'Flame',
      displayOrder: 4,
    },
  });

  const catDesserts = await prisma.menuCategory.create({
    data: {
      name: 'Decadent Desserts',
      slug: 'desserts',
      description: 'Pastry chef specials, rich mousses, and artisanal gelatos.',
      icon: 'Cake',
      displayOrder: 5,
    },
  });

  const catBeverages = await prisma.menuCategory.create({
    data: {
      name: 'Signature Beverages',
      slug: 'beverages',
      description: 'Craft mocktails, cold brews, artisanal sodas, and fresh infusions.',
      icon: 'GlassWater',
      displayOrder: 6,
    },
  });

  console.log('✅ Created 6 menu categories.');

  // 3. Create Menu Items (18 items)
  const menuItemsData = [
    // Starters
    {
      categoryId: catStarters.id,
      name: 'Truffle Burrata & Heirloom Bruschetta',
      slug: 'truffle-burrata-bruschetta',
      description: 'Creamy Pugliese burrata, heirloom cherry tomatoes, cold-pressed basil oil, 12-year balsamic glaze on toasted ciabatta.',
      price: 16.50,
      image: 'https://images.unsplash.com/photo-1592417817098-8f3d69106093?w=600&auto=format&fit=crop&q=80',
      isVeg: true,
      isGlutenFree: false,
      isSpicy: false,
      isPopular: true,
      prepTimeMinutes: 12,
      calories: 420,
      ingredients: 'Burrata cheese, Heirloom tomatoes, Ciabatta bread, Basil, Extra virgin olive oil, Balsamic reduction',
    },
    {
      categoryId: catStarters.id,
      name: 'Crispy Calamari Fritti',
      slug: 'crispy-calamari-fritti',
      description: 'Tender Monterey squid tossed in seasoned semolina, flash-fried with grilled Meyer lemon and spicy Calabrian chili aioli.',
      price: 18.00,
      image: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=600&auto=format&fit=crop&q=80',
      isVeg: false,
      isGlutenFree: false,
      isSpicy: true,
      isPopular: true,
      prepTimeMinutes: 14,
      calories: 510,
      ingredients: 'Calamari, Semolina crust, Meyer lemon, Garlic aioli, Calabrian chili paste, Fresh parsley',
    },
    {
      categoryId: catStarters.id,
      name: 'Wild Forest Mushroom Arancini',
      slug: 'wild-mushroom-arancini',
      description: 'Crispy risotto spheres stuffed with porcini mushrooms, fontina cheese center, served over roasted garlic truffle fondue.',
      price: 15.00,
      image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=600&auto=format&fit=crop&q=80',
      isVeg: true,
      isGlutenFree: false,
      isSpicy: false,
      isPopular: false,
      prepTimeMinutes: 15,
      calories: 480,
      ingredients: 'Arborio rice, Porcini mushrooms, Fontina cheese, Panko breadcrumbs, Truffle cream',
    },

    // Pizzas
    {
      categoryId: catPizzas.id,
      name: 'Margherita D.O.P. di Bufala',
      slug: 'margherita-dop-di-bufala',
      description: 'San Marzano D.O.P. tomato sauce, fresh buffalo mozzarella, fragrant sweet basil, sea salt, and extra virgin olive oil.',
      price: 21.00,
      image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80',
      isVeg: true,
      isGlutenFree: false,
      isSpicy: false,
      isPopular: true,
      prepTimeMinutes: 16,
      calories: 780,
      ingredients: '48-hr fermented dough, San Marzano tomatoes, Buffalo mozzarella, Fresh basil leaves, Olive oil',
    },
    {
      categoryId: catPizzas.id,
      name: 'Spicy Diavola & Hot Honey',
      slug: 'spicy-diavola-hot-honey',
      description: 'Artisanal Calabrese salami, spicy nduja paste, smoked provolone, pickled red Fresno chilies, drizzled with habanero hot honey.',
      price: 24.50,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
      isVeg: false,
      isGlutenFree: false,
      isSpicy: true,
      isPopular: true,
      prepTimeMinutes: 18,
      calories: 890,
      ingredients: 'Sourdough crust, Calabrese salami, Nduja sausage, Provolone, Fresno peppers, Hot honey drizzle',
    },
    {
      categoryId: catPizzas.id,
      name: 'Tartufo Nero & Wild Mushroom',
      slug: 'tartufo-nero-wild-mushroom',
      description: 'Black truffle cream base, roasted wild chanterelles, fior di latte, aged pecorino romano, and fresh thyme.',
      price: 26.00,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80',
      isVeg: true,
      isGlutenFree: false,
      isSpicy: false,
      isPopular: false,
      prepTimeMinutes: 18,
      calories: 820,
      ingredients: 'Black truffle cream, Chanterelle mushrooms, Fior di latte, Pecorino Romano, Fresh thyme',
    },

    // Pastas
    {
      categoryId: catPastas.id,
      name: 'Handcrafted Tagliatelle al Tartufo',
      slug: 'tagliatelle-al-tartufo',
      description: 'Egg tagliatelle rolled in-house, tossed in cultured French butter, 24-month Parmigiano-Reggiano, and shaved Norcia black truffle.',
      price: 28.00,
      image: 'https://images.unsplash.com/photo-1621996346565-e3d5d62817d2?w=600&auto=format&fit=crop&q=80',
      isVeg: true,
      isGlutenFree: false,
      isSpicy: false,
      isPopular: true,
      prepTimeMinutes: 16,
      calories: 640,
      ingredients: 'Fresh egg tagliatelle, Cultured butter, Parmigiano-Reggiano, Black truffle shavings',
    },
    {
      categoryId: catPastas.id,
      name: 'Slow-Braised Short Rib Pappardelle',
      slug: 'short-rib-pappardelle',
      description: 'Wide ribbon pappardelle with 8-hour braised Angus beef short rib ragù, rosemary, San Marzano tomato reduction, and whipped ricotta.',
      price: 27.50,
      image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80',
      isVeg: false,
      isGlutenFree: false,
      isSpicy: false,
      isPopular: true,
      prepTimeMinutes: 18,
      calories: 760,
      ingredients: 'Pappardelle pasta, Angus beef short rib, Chianti red wine, Mirepoix, Whipped whole milk ricotta',
    },
    {
      categoryId: catPastas.id,
      name: 'Spaghetti ai Frutti di Mare',
      slug: 'spaghetti-frutti-di-mare',
      description: 'Extruded durum wheat spaghetti with jumbo prawns, Manila clams, PEI mussels, white wine, garlic, cherry tomatoes, and red chili flakes.',
      price: 29.00,
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
      isVeg: false,
      isGlutenFree: false,
      isSpicy: true,
      isPopular: false,
      prepTimeMinutes: 20,
      calories: 610,
      ingredients: 'Spaghetti, Gulf tiger prawns, Manila clams, Mussels, White wine broth, Garlic, Parsley',
    },

    // Mains
    {
      categoryId: catMains.id,
      name: 'Wood-Fired Prime Ribeye Steak (14oz)',
      slug: 'prime-ribeye-steak',
      description: 'USDA Prime dry-aged 28 days, grilled over red oak, served with bone marrow roasted garlic butter and crispy duck fat potatoes.',
      price: 46.00,
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&auto=format&fit=crop&q=80',
      isVeg: false,
      isGlutenFree: true,
      isSpicy: false,
      isPopular: true,
      prepTimeMinutes: 24,
      calories: 950,
      ingredients: 'USDA Prime ribeye, Bone marrow compound butter, Fingerling potatoes, Rosemary, Sea salt flakes',
    },
    {
      categoryId: catMains.id,
      name: 'Pan-Roasted Chilean Sea Bass',
      slug: 'pan-roasted-chilean-sea-bass',
      description: 'Sustainably caught sea bass fillet, saffron cauliflower silk, baby leeks, crispy capers, and citrus-caper emulsion.',
      price: 42.00,
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80',
      isVeg: false,
      isGlutenFree: true,
      isSpicy: false,
      isPopular: false,
      prepTimeMinutes: 22,
      calories: 580,
      ingredients: 'Chilean sea bass, Saffron puree, Baby leeks, Crispy capers, Lemon beurre blanc',
    },
    {
      categoryId: catMains.id,
      name: 'Roasted Herb Butter Half Chicken',
      slug: 'roasted-herb-half-chicken',
      description: 'Organic free-range chicken roasted with garlic herb butter, charred broccolini, creamy Yukon gold potato puree, and pan jus.',
      price: 31.00,
      image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&auto=format&fit=crop&q=80',
      isVeg: false,
      isGlutenFree: true,
      isSpicy: false,
      isPopular: false,
      prepTimeMinutes: 20,
      calories: 720,
      ingredients: 'Organic chicken, Garlic herb butter, Charred broccolini, Yukon Gold potatoes, Natural pan reduction',
    },

    // Desserts
    {
      categoryId: catDesserts.id,
      name: 'Classic Venetian Tiramisù al Mascarpone',
      slug: 'venetian-tiramisu',
      description: 'Savoiardi ladyfingers steeped in Illy espresso & Marsala wine, layered with fluffy mascarpone cream and Valrhona cocoa.',
      price: 12.50,
      image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80',
      isVeg: true,
      isGlutenFree: false,
      isSpicy: false,
      isPopular: true,
      prepTimeMinutes: 8,
      calories: 450,
      ingredients: 'Savoiardi biscuits, Illy espresso, Mascarpone cheese, Farm egg yolks, Valrhona dark cocoa',
    },
    {
      categoryId: catDesserts.id,
      name: 'Molten Belgian Chocolate Lava Cake',
      slug: 'chocolate-lava-cake',
      description: 'Warm 70% dark chocolate souffle cake with a molten center, served with house-spun Tahitian vanilla bean gelato and raspberry coulis.',
      price: 14.00,
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
      isVeg: true,
      isGlutenFree: false,
      isSpicy: false,
      isPopular: true,
      prepTimeMinutes: 14,
      calories: 590,
      ingredients: '70% Belgian chocolate, Butter, Eggs, Vanilla gelato, Raspberry coulis',
    },
    {
      categoryId: catDesserts.id,
      name: 'Sicilian Pistachio Panna Cotta',
      slug: 'sicilian-pistachio-panna-cotta',
      description: 'Silky cream infused with Bronte pistachio paste, layered with roasted crushed pistachios and pomegranate reduction.',
      price: 13.00,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      isVeg: true,
      isGlutenFree: true,
      isSpicy: false,
      isPopular: false,
      prepTimeMinutes: 8,
      calories: 380,
      ingredients: 'Fresh heavy cream, Bronte pistachios, Gelatin, Pomegranate seeds, Wild honey',
    },

    // Beverages
    {
      categoryId: catBeverages.id,
      name: 'Smoked Rosemary Citrus Mocktail',
      slug: 'smoked-rosemary-citrus-mocktail',
      description: 'Blood orange juice, fresh yuzu, agave nectar, sparkling San Pellegrino, torched rosemary sprig, served over crystal ice rock.',
      price: 9.50,
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
      isVeg: true,
      isGlutenFree: true,
      isSpicy: false,
      isPopular: true,
      prepTimeMinutes: 6,
      calories: 140,
      ingredients: 'Blood orange juice, Yuzu puree, Agave nectar, Torched fresh rosemary, Sparkling water',
    },
    {
      categoryId: catBeverages.id,
      name: 'Passionfruit Ginger Fizz',
      slug: 'passionfruit-ginger-fizz',
      description: 'Tropical passionfruit pulp, cold-pressed spicy ginger juice, mint leaves, lime juice, and artisanal tonic.',
      price: 8.50,
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
      isVeg: true,
      isGlutenFree: true,
      isSpicy: true,
      isPopular: false,
      prepTimeMinutes: 6,
      calories: 120,
      ingredients: 'Passionfruit, Fresh ginger juice, Mint, Lime, Tonic water',
    },
    {
      categoryId: catBeverages.id,
      name: 'Cold Drip Nitro Reserve Coffee',
      slug: 'nitro-cold-brew-coffee',
      description: '18-hour slow-steeped Ethiopian single-origin beans infused with nitrogen for a velvety micro-foam head and chocolate notes.',
      price: 7.00,
      image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
      isVeg: true,
      isGlutenFree: true,
      isSpicy: false,
      isPopular: false,
      prepTimeMinutes: 4,
      calories: 10,
      ingredients: 'Ethiopian Yirgacheffe coffee beans, Triple-filtered water, Pure nitrogen gas',
    },
  ];

  const createdMenuItems = [];
  for (const item of menuItemsData) {
    const created = await prisma.menuItem.create({
      data: item,
    });
    createdMenuItems.push(created);
  }

  console.log(`✅ Created ${createdMenuItems.length} gourmet menu items with complete nutritional & allergen data.`);

  // 4. Create Restaurant Tables (10 tables)
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

  const createdTables = [];
  for (const t of tablesData) {
    const created = await prisma.restaurantTable.create({
      data: t,
    });
    createdTables.push(created);
  }

  console.log(`✅ Created ${createdTables.length} dining tables across all restaurant zones.`);

  // 5. Create Table Reservations
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const reservationsData = [
    {
      userId: customer1.id,
      tableId: createdTables[5].id, // Table 6 (Patio)
      customerName: customer1.name,
      customerEmail: customer1.email,
      customerPhone: customer1.phone,
      reservationDate: today,
      timeSlot: '07:30 PM',
      guestCount: 4,
      specialRequests: 'Anniversary dinner. Would appreciate a quiet corner on the patio.',
      status: 'CONFIRMED',
    },
    {
      userId: customer2.id,
      tableId: createdTables[7].id, // Table 8 (VIP)
      customerName: customer2.name,
      customerEmail: customer2.email,
      customerPhone: customer2.phone,
      reservationDate: tomorrow,
      timeSlot: '08:00 PM',
      guestCount: 6,
      specialRequests: 'Executive client dinner. Please have sparkling water ready.',
      status: 'CONFIRMED',
    },
    {
      userId: customer3.id,
      tableId: createdTables[0].id, // Table 1 (Window)
      customerName: customer3.name,
      customerEmail: customer3.email,
      customerPhone: customer3.phone,
      reservationDate: today,
      timeSlot: '01:00 PM',
      guestCount: 2,
      specialRequests: 'Window view preferred for lunch meeting.',
      status: 'SEATED',
    },
  ];

  for (const r of reservationsData) {
    await prisma.reservation.create({
      data: r,
    });
  }

  console.log('✅ Created table reservations.');

  // 6. Create Active and Historical Orders
  const ordersData = [
    // Order 1: Active In-Kitchen (Dine-in at Table 2)
    {
      orderNumber: 'ORD-2024-1001',
      userId: customer1.id,
      tableId: createdTables[1].id,
      customerName: 'Sophia Miller',
      customerEmail: 'sophia.miller@example.com',
      customerPhone: '+1 (555) 912-3456',
      orderType: 'DINE_IN',
      status: 'PREPARING',
      subtotal: 72.50,
      tax: 5.98,
      deliveryFee: 0,
      discount: 0,
      total: 78.48,
      notes: 'Extra parmesan cheese on the pasta please.',
      estimatedPrepMin: 20,
      paymentMethod: 'CARD',
      paymentStatus: 'PAID',
      items: [
        { menuItemId: createdMenuItems[0].id, quantity: 1, unitPrice: 16.50, totalPrice: 16.50, specialInstructions: 'Dressing on the side' },
        { menuItemId: createdMenuItems[6].id, quantity: 1, unitPrice: 28.00, totalPrice: 28.00, specialInstructions: 'Al dente' },
        { menuItemId: createdMenuItems[7].id, quantity: 1, unitPrice: 27.50, totalPrice: 27.50, specialInstructions: null },
      ],
    },

    // Order 2: Freshly Placed (Dine-in at Table 5)
    {
      orderNumber: 'ORD-2024-1002',
      userId: customer2.id,
      tableId: createdTables[4].id,
      customerName: 'Ethan Hunt',
      customerEmail: 'ethan.hunt@example.com',
      customerPhone: '+1 (555) 823-4567',
      orderType: 'DINE_IN',
      status: 'PLACED',
      subtotal: 108.50,
      tax: 8.95,
      deliveryFee: 0,
      discount: 10.00,
      total: 107.45,
      notes: 'Please bring steaks medium rare.',
      estimatedPrepMin: 25,
      paymentMethod: 'ONLINE',
      paymentStatus: 'PAID',
      items: [
        { menuItemId: createdMenuItems[9].id, quantity: 2, unitPrice: 46.00, totalPrice: 92.00, specialInstructions: 'Medium-rare with extra compound butter' },
        { menuItemId: createdMenuItems[15].id, quantity: 2, unitPrice: 8.25, totalPrice: 16.50, specialInstructions: null },
      ],
    },

    // Order 3: Food Ready for Pickup (Takeaway)
    {
      orderNumber: 'ORD-2024-1003',
      userId: customer3.id,
      tableId: null,
      customerName: 'Olivia Davis',
      customerEmail: 'olivia.davis@example.com',
      customerPhone: '+1 (555) 634-5678',
      orderType: 'TAKEAWAY',
      status: 'READY',
      subtotal: 45.50,
      tax: 3.75,
      deliveryFee: 0,
      discount: 0,
      total: 49.25,
      notes: 'Customer will pick up at counter.',
      estimatedPrepMin: 15,
      paymentMethod: 'CARD',
      paymentStatus: 'PAID',
      items: [
        { menuItemId: createdMenuItems[3].id, quantity: 1, unitPrice: 21.00, totalPrice: 21.00, specialInstructions: 'Cut into 8 slices' },
        { menuItemId: createdMenuItems[4].id, quantity: 1, unitPrice: 24.50, totalPrice: 24.50, specialInstructions: 'Extra hot honey' },
      ],
    },

    // Order 4: Completed Delivery Order
    {
      orderNumber: 'ORD-2024-1004',
      userId: customer1.id,
      tableId: null,
      customerName: 'Sophia Miller',
      customerEmail: 'sophia.miller@example.com',
      customerPhone: '+1 (555) 912-3456',
      orderType: 'DELIVERY',
      status: 'COMPLETED',
      subtotal: 58.50,
      tax: 4.83,
      deliveryFee: 4.99,
      discount: 5.00,
      total: 64.32,
      deliveryAddress: '742 Evergreen Terrace, Apt 4B, Boston, MA',
      notes: 'Leave at front desk with doorman.',
      estimatedPrepMin: 30,
      paymentMethod: 'ONLINE',
      paymentStatus: 'PAID',
      items: [
        { menuItemId: createdMenuItems[1].id, quantity: 1, unitPrice: 18.00, totalPrice: 18.00, specialInstructions: null },
        { menuItemId: createdMenuItems[10].id, quantity: 1, unitPrice: 42.00, totalPrice: 42.00, specialInstructions: null },
        { menuItemId: createdMenuItems[12].id, quantity: 1, unitPrice: 12.50, totalPrice: 12.50, specialInstructions: null },
      ],
    },
  ];

  for (const ord of ordersData) {
    const createdOrder = await prisma.order.create({
      data: {
        orderNumber: ord.orderNumber,
        userId: ord.userId,
        tableId: ord.tableId,
        customerName: ord.customerName,
        customerEmail: ord.customerEmail,
        customerPhone: ord.customerPhone,
        orderType: ord.orderType,
        status: ord.status,
        subtotal: ord.subtotal,
        tax: ord.tax,
        deliveryFee: ord.deliveryFee,
        discount: ord.discount,
        total: ord.total,
        notes: ord.notes,
        deliveryAddress: ord.deliveryAddress,
        estimatedPrepMin: ord.estimatedPrepMin,
      },
    });

    for (const it of ord.items) {
      await prisma.orderItem.create({
        data: {
          orderId: createdOrder.id,
          menuItemId: it.menuItemId,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          totalPrice: it.totalPrice,
          specialInstructions: it.specialInstructions,
        },
      });
    }

    await prisma.payment.create({
      data: {
        orderId: createdOrder.id,
        transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        amount: ord.total,
        paymentMethod: ord.paymentMethod,
        status: ord.paymentStatus,
        paidAt: new Date(),
      },
    });
  }

  console.log('✅ Created orders, order items, and payment transactions.');
  console.log('🎉 DineDesk database seeded successfully with full gourmet culinary operations!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
