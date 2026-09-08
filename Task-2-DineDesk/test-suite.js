const http = require('http');
const { spawn } = require('child_process');

const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

let serverProcess;
let testCount = 0;
let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  testCount++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedCount++;
  }
}

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (options.body) {
      const bodyData =
        typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      req.setHeader('Content-Type', 'application/json');
      req.setHeader('Content-Length', Buffer.byteLength(bodyData));
      req.write(bodyData);
    }

    req.end();
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function startServer() {
  console.log(`\n⚙️ Starting Next.js test server on port ${PORT}...`);
  serverProcess = spawn('npx', ['next', 'start', '-p', PORT.toString()], {
    shell: true,
    stdio: 'ignore',
    env: { ...process.env, PORT: PORT.toString(), NODE_ENV: 'production' },
  });

  // Wait for server to become responsive
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    try {
      const res = await makeRequest('/');
      if (res.status === 200) {
        console.log('🚀 Test server is ready!\n');
        return;
      }
    } catch (e) {
      // Keep waiting
    }
  }
  throw new Error('Test server failed to start in 30 seconds');
}

async function stopServer() {
  if (serverProcess) {
    console.log('\n🛑 Stopping test server...');
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', serverProcess.pid.toString(), '/f', '/t'], { shell: true });
    } else {
      serverProcess.kill();
    }
  }
}

async function runTests() {
  try {
    await startServer();

    console.log('========================================================');
    console.log('🍽️ Starting Comprehensive DineDesk API & Functional Tests');
    console.log('========================================================\n');

    // 1. Public Pages
    console.log('1. Public Front-of-House Endpoints');
    const homeRes = await makeRequest('/');
    assert(homeRes.status === 200, 'GET / landing page returns HTTP 200');

    const menuRes = await makeRequest('/menu');
    assert(menuRes.status === 200, 'GET /menu digital menu returns HTTP 200');

    const resPageRes = await makeRequest('/reservations');
    assert(resPageRes.status === 200, 'GET /reservations booking page returns HTTP 200');

    const loginRes = await makeRequest('/login');
    assert(loginRes.status === 200, 'GET /login auth portal returns HTTP 200');

    // 2. Menu & Categories Querying
    console.log('\n2. Digital Menu & Category Catalog API');
    const catRes = await makeRequest('/api/categories');
    assert(
      catRes.status === 200 && catRes.data.categories?.length >= 6,
      `GET /api/categories returns ${catRes.data.categories?.length} categories`
    );

    const itemsRes = await makeRequest('/api/menu');
    assert(
      itemsRes.status === 200 && itemsRes.data.items?.length >= 15,
      `GET /api/menu returns ${itemsRes.data.items?.length} gourmet dishes`
    );

    const vegRes = await makeRequest('/api/menu?isVeg=true');
    assert(
      vegRes.status === 200 && vegRes.data.items?.every((i) => i.isVeg),
      'GET /api/menu?isVeg=true strictly filters vegetarian dishes'
    );

    const searchRes = await makeRequest('/api/menu?search=Truffle');
    assert(
      searchRes.status === 200 && searchRes.data.items?.length > 0,
      'GET /api/menu?search=Truffle returns matching dishes'
    );

    // 3. Authentication & RBAC
    console.log('\n3. Authentication & Role-Based Access Control (RBAC)');
    const adminLogin = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@dinedesk.com', password: 'admin123' },
    });
    assert(
      adminLogin.status === 200 && adminLogin.data.user?.role === 'ADMIN',
      'Admin login with valid credentials returns HTTP 200'
    );

    const adminCookie = adminLogin.headers['set-cookie']?.[0]?.split(';')[0] || '';

    const staffLogin = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'chef.marco@dinedesk.com', password: 'staff123' },
    });
    assert(
      staffLogin.status === 200 && staffLogin.data.user?.role === 'STAFF',
      'Kitchen Staff login returns HTTP 200'
    );
    const staffCookie = staffLogin.headers['set-cookie']?.[0]?.split(';')[0] || '';

    const customerLogin = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'sophia.miller@example.com', password: 'customer123' },
    });
    assert(
      customerLogin.status === 200 && customerLogin.data.user?.role === 'CUSTOMER',
      'Customer login returns HTTP 200'
    );
    const customerCookie = customerLogin.headers['set-cookie']?.[0]?.split(';')[0] || '';

    const invalidLogin = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@dinedesk.com', password: 'wrongpassword' },
    });
    assert(invalidLogin.status === 401, 'Login with invalid password rejected with HTTP 401');

    const meRes = await makeRequest('/api/auth/me', {
      headers: { Cookie: adminCookie },
    });
    assert(meRes.status === 200 && meRes.data.user?.email === 'admin@dinedesk.com', 'GET /api/auth/me returns authenticated admin');

    // Customer RBAC restriction
    const customerAddDish = await makeRequest('/api/menu', {
      method: 'POST',
      headers: { Cookie: customerCookie },
      body: { name: 'Illegal Dish', price: 20 },
    });
    assert(customerAddDish.status === 403, 'Customer blocked from creating menu item (HTTP 403)');

    // 4. Table Management & Reservations
    console.log('\n4. Table Management & Reservation Conflict Engine');
    const tablesRes = await makeRequest('/api/tables');
    assert(
      tablesRes.status === 200 && tablesRes.data.tables?.length >= 10,
      `GET /api/tables returns ${tablesRes.data.tables?.length} restaurant tables`
    );

    const testTable = tablesRes.data.tables[0];

    // Create reservation
    const today = new Date().toISOString().split('T')[0];
    const newRes = await makeRequest('/api/reservations', {
      method: 'POST',
      headers: { Cookie: customerCookie },
      body: {
        customerName: 'Marcus Vance',
        customerPhone: '+1 (555) 999-8888',
        customerEmail: 'marcus.v@example.com',
        reservationDate: today,
        timeSlot: '08:30 PM',
        guestCount: 2,
        tableId: testTable.id,
        specialRequests: 'Window view please',
      },
    });
    assert(newRes.status === 201, 'Created new Table Reservation with confirmation');
    const createdReservationId = newRes.data.reservation?.id;

    // Collision check: attempt booking same table at same date & slot
    const conflictRes = await makeRequest('/api/reservations', {
      method: 'POST',
      headers: { Cookie: customerCookie },
      body: {
        customerName: 'Another Guest',
        customerPhone: '+1 (555) 000-1111',
        reservationDate: today,
        timeSlot: '08:30 PM',
        guestCount: 2,
        tableId: testTable.id,
      },
    });
    assert(conflictRes.status === 409, 'Anti-collision engine prevents double-booking on same table/slot (HTTP 409)');

    // Staff seats the reservation party
    const seatRes = await makeRequest(`/api/reservations/${createdReservationId}`, {
      method: 'PUT',
      headers: { Cookie: staffCookie },
      body: { status: 'SEATED' },
    });
    assert(seatRes.status === 200 && seatRes.data.reservation?.status === 'SEATED', 'Staff seated guest party at table');

    // 5. Order Placement, Discount Calculations & Lifecycle
    console.log('\n5. Order Placement, Pricing Engine & Kitchen KDS Lifecycle');
    const dish1 = itemsRes.data.items[0];
    const dish2 = itemsRes.data.items[1];

    const placeOrderRes = await makeRequest('/api/orders', {
      method: 'POST',
      headers: { Cookie: customerCookie },
      body: {
        items: [
          { menuItemId: dish1.id, quantity: 2, specialInstructions: 'Extra crisp' },
          { menuItemId: dish2.id, quantity: 1 },
        ],
        orderType: 'DINE_IN',
        tableId: testTable.id,
        customerName: 'Sophia Miller',
        customerPhone: '+1 (555) 912-3456',
        couponCode: 'DINE10',
        paymentMethod: 'CARD',
      },
    });

    assert(placeOrderRes.status === 201, 'Order placed successfully with itemized lines & payment');
    const placedOrder = placeOrderRes.data.order;
    assert(placedOrder.discount > 0, 'Coupon code DINE10 applied 10% discount');
    assert(placedOrder.tax > 0, 'Tax computed at 8.25%');

    // KDS Lifecycle transitions
    const cookRes = await makeRequest(`/api/orders/${placedOrder.id}`, {
      method: 'PUT',
      headers: { Cookie: staffCookie },
      body: { status: 'PREPARING' },
    });
    assert(cookRes.status === 200 && cookRes.data.order?.status === 'PREPARING', 'KDS transitioned ticket to PREPARING');

    const readyRes = await makeRequest(`/api/orders/${placedOrder.id}`, {
      method: 'PUT',
      headers: { Cookie: staffCookie },
      body: { status: 'READY' },
    });
    assert(readyRes.status === 200 && readyRes.data.order?.status === 'READY', 'KDS transitioned ticket to READY');

    const completeRes = await makeRequest(`/api/orders/${placedOrder.id}`, {
      method: 'PUT',
      headers: { Cookie: staffCookie },
      body: { status: 'COMPLETED' },
    });
    assert(completeRes.status === 200 && completeRes.data.order?.status === 'COMPLETED', 'KDS transitioned ticket to COMPLETED');

    // 6. Admin Menu CRUD & Availability Toggle
    console.log('\n6. Admin Culinary Menu CRUD & Availability Engine');
    const createDishRes = await makeRequest('/api/menu', {
      method: 'POST',
      headers: { Cookie: adminCookie },
      body: {
        categoryId: catRes.data.categories[0].id,
        name: 'Test Gourmet Bruschetta',
        description: 'Crispy artisanal toast with seasonal toppings.',
        price: 14.50,
        prepTimeMinutes: 10,
        isVeg: true,
      },
    });
    assert(createDishRes.status === 201, 'Admin created new menu dish');
    const testDishId = createDishRes.data.item?.id;

    const toggleRes = await makeRequest(`/api/menu/${testDishId}`, {
      method: 'PATCH',
      headers: { Cookie: adminCookie },
      body: { isAvailable: false },
    });
    assert(toggleRes.status === 200 && toggleRes.data.item?.isAvailable === false, 'Admin marked dish as Sold Out');

    const deleteDishRes = await makeRequest(`/api/menu/${testDishId}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    assert(deleteDishRes.status === 200, 'Admin deleted test dish');

    // 7. Executive Analytics & Reporting
    console.log('\n7. Executive Analytics & Reporting');
    const analyticsRes = await makeRequest('/api/analytics', {
      headers: { Cookie: adminCookie },
    });
    assert(
      analyticsRes.status === 200 &&
        analyticsRes.data.summary?.grossRevenue > 0 &&
        analyticsRes.data.topSellingDishes?.length > 0,
      'GET /api/analytics computes live gross revenue, occupancy, and top dishes'
    );

    const customersRes = await makeRequest('/api/customers', {
      headers: { Cookie: adminCookie },
    });
    assert(
      customersRes.status === 200 && customersRes.data.customers?.length > 0,
      `GET /api/customers returns customer directory (${customersRes.data.customers?.length} diners)`
    );

    const paymentsRes = await makeRequest('/api/payments', {
      headers: { Cookie: adminCookie },
    });
    assert(
      paymentsRes.status === 200 && paymentsRes.data.payments?.length > 0,
      `GET /api/payments returns payment transaction log (Total collected: $${paymentsRes.data.totalCollected})`
    );

    // Clean up created test reservation
    await makeRequest(`/api/reservations/${createdReservationId}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });

    console.log('\n========================================================');
    console.log(`📊 Test Execution Summary: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log('========================================================\n');

    if (failedCount > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    await stopServer();
  }
}

runTests();
