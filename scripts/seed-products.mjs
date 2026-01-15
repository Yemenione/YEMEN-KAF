
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const missingProducts = [
  {
    name: "Royal Sidr Honey",
    slug: "royal-sidr-honey",
    description: "Premium Royal Sidr Honey from the Do'an Valley.",
    price: 180.00,
    category_slug: "produits-sucres", // Fallback category
    image_url: "/images/honey-jar.jpg",
    stock_quantity: 50
  },
  {
    name: "Haraz Mocha Beans",
    slug: "haraz-mocha-beans",
    description: "Authentic Haraz Mocha Coffee Beans.",
    price: 45.00,
    category_slug: "produits-sucres",
    image_url: "/images/coffee-beans.jpg",
    stock_quantity: 100
  },
  {
    name: "Wild Mountain Comb",
    slug: "wild-mountain-comb",
    description: "Raw Honey Comb from the Yemeni mountains.",
    price: 220.00,
    category_slug: "produits-sucres",
    image_url: "/images/honey-comb.jpg",
    stock_quantity: 20
  }
];

async function seedProducts() {
  console.log('Seeding missing products...');
  try {
    // Get category ID (just grabbing the first one for simplicity/fallback)
    const [categories] = await pool.execute('SELECT id FROM categories LIMIT 1');
    const categoryId = categories[0]?.id || 1;

    for (const product of missingProducts) {
      console.log(`Checking ${product.slug}...`);
      const [rows] = await pool.execute('SELECT id FROM products WHERE slug = ?', [product.slug]);

      if (rows.length === 0) {
        await pool.execute(
          `INSERT INTO products (name, slug, description, price, category_id, image_url, stock_quantity, is_active) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [product.name, product.slug, product.description, product.price, categoryId, product.image_url, product.stock_quantity]
        );
        console.log(`✅ Inserted: ${product.name}`);
      } else {
        console.log(`ℹ️ Exists: ${product.name}`);
      }
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

seedProducts();
