
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public/images');
const productsDir = path.resolve(publicDir, 'products');

// Expected images from setup-database.sql
const missingImages = [
    'madara-individuelle.jpg',
    'madara-famille-19.jpg',
    'madara-famille-22.jpg',
    'jarre-terre.jpg',
    'maouaze.jpg',
    'sitare.jpg',
    'massone.jpg',
    'savon-curcuma.jpg',
    'henne-250.jpg',
    'henne-125.jpg',
    'parfum-jasmin.jpg',
    'roz-rana.jpg',
    'louban-macher.jpg',
    'louban-dakar.jpg',
    'encensoir.jpg',
    'bakhour-rana.jpg',
    'bakhour-30.jpg',
    'bakhour-80.jpg',
    'custard.jpg',
    'caramels.jpg'
];

// Available source images
const sources = [
    'honey-jar.jpg',
    'coffee-beans.jpg',
    'honey-comb.jpg'
];

async function fixImages() {
    if (!fs.existsSync(productsDir)) {
        fs.mkdirSync(productsDir, { recursive: true });
    }

    console.log('Fixing missing images...');

    for (const [index, image] of missingImages.entries()) {
        const destPath = path.join(productsDir, image);

        if (!fs.existsSync(destPath)) {
            // Pick a source image nicely
            const sourceImage = sources[index % sources.length];
            const sourcePath = path.join(publicDir, sourceImage);

            if (fs.existsSync(sourcePath)) {
                fs.copyFileSync(sourcePath, destPath);
                console.log(`✅ Created: ${image} (from ${sourceImage})`);
            } else {
                console.warn(`⚠️ Source missing: ${sourceImage}`);
            }
        } else {
            console.log(`ℹ️ Exists: ${image}`);
        }
    }

    console.log('Done!');
}

fixImages();
