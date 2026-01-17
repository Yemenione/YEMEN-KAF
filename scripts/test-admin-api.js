
// Native fetch is available in Node.js 18+
// const fetch = require('node-fetch');

// Hardcoded for local testing based on user env
const BASE_URL = 'http://localhost:3000/api';

async function fetchWithLog(url, options) {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return { ok: res.ok, data: await res.json(), status: res.status };
    }
    const text = await res.text();
    return { ok: res.ok, data: text, status: res.status, isText: true };
}

async function testAdminAPI() {
    console.log('🧪 Starting Admin API Verification...\n');

    // 0. Test DB Connection via API
    try {
        console.log('0. Testing GET /test-db (Env Check)...');
        const { ok, data, status } = await fetchWithLog(`${BASE_URL}/test-db`);
        if (ok) {
            console.log('✅ DB Connection API: Success', data);
        } else {
            console.error(`❌ DB Connection API Failed (${status}):`, data);
            console.warn('⚠️  If this fails, restart the dev server to load .env changes.');
            return;
        }
    } catch (e) {
        console.error('API Error:', e.message);
        return;
    }

    let productId = null;

    // 1. Create a Product
    try {
        console.log('\n1. Testing POST /products (Create)...');
        const { ok, data, status } = await fetchWithLog(`${BASE_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Test Admin Product",
                sku: `TEST-SKU-${Date.now()}`,
                price: 99.99,
                stock_quantity: 10,
                description: "Created via API test script",
                is_active: true
            })
        });

        if (ok && data.success) {
            console.log('✅ Product Created. ID:', data.productId);
            productId = data.productId;
        } else {
            console.error(`❌ Failed to create product (${status}):`, data);
        }
    } catch (e) { console.error('API Error:', e.message); }

    // 2. Fetch Products
    try {
        console.log('\n2. Testing GET /products (List)...');
        const { ok, data, status } = await fetchWithLog(`${BASE_URL}/products?limit=5`);
        if (ok && Array.isArray(data.products)) {
            console.log(`✅ Fetched ${data.products.length} products.`);
            if (productId) {
                const found = data.products.find(p => p.id === productId);
                console.log(found ? '✅ Created product found in list.' : '❌ Created product NOT in list.');
            }
        } else {
            console.error(`❌ Failed to list products (${status}):`, data);
        }
    } catch (e) { console.error('API Error:', e.message); }

    // 3. Update Product
    if (productId) {
        try {
            console.log(`\n3. Testing PUT /products/${productId} (Update)...`);
            const { ok, data, status } = await fetchWithLog(`${BASE_URL}/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    price: 150.00,
                    name: "Updated Test Product"
                })
            });
            if (ok && data.success) {
                console.log('✅ Product Updated.');
            } else {
                console.error(`❌ Failed to update product (${status}):`, data);
            }
        } catch (e) { console.error('API Error:', e.message); }
    }

    // 4. Test Orders API
    try {
        console.log('\n4. Testing GET /orders (Admin List)...');
        const { ok, data, status } = await fetchWithLog(`${BASE_URL}/orders?limit=1`);
        if (ok && Array.isArray(data.orders)) {
            console.log(`✅ Fetched ${data.orders.length} orders. Total: ${data.total}`);
        } else {
            console.error(`❌ Failed to list orders (${status}):`, data);
        }
    } catch (e) { console.error('API Error:', e.message); }

    // 5. Test Customers API
    try {
        console.log('\n5. Testing GET /customers (List)...');
        const { ok, data, status } = await fetchWithLog(`${BASE_URL}/customers?limit=1`);
        if (ok && Array.isArray(data.customers)) {
            console.log(`✅ Fetched ${data.customers.length} customers.`);
        } else {
            console.error(`❌ Failed to list customers (${status}):`, data);
        }
    } catch (e) { console.error('API Error:', e.message); }

    // Cleanup (Delete Product)
    if (productId) {
        try {
            console.log(`\n6. Testing DELETE /products/${productId}...`);
            const { ok, data, status } = await fetchWithLog(`${BASE_URL}/products/${productId}`, { method: 'DELETE' });
            if (ok) {
                console.log('✅ Product Deleted.');
            } else {
                console.error(`❌ Failed to delete product (${status}):`, data);
            }
        } catch (e) { console.error('API Error:', e.message); }
    }
}

testAdminAPI();
