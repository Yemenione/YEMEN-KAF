const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Basic manual env loading if dotenv fails
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
for (const line of lines) {
    if (line.startsWith('DATABASE_URL=')) {
        process.env.DATABASE_URL = line.split('=')[1].trim();
    }
}

console.log('Manually loaded DATABASE_URL:', process.env.DATABASE_URL ? 'YES' : 'NO');

try {
    console.log('Running: npx prisma generate...');
    execSync('npx prisma generate', {
        stdio: 'inherit',
        env: process.env // Explicitly pass env
    });
    console.log('SUCCESS: Prisma Client generated.');
} catch (error) {
    console.error('FAILURE: Prisma Client generation failed.');
    if (error.stdout) console.log('STDOUT:', error.stdout.toString());
    if (error.stderr) console.log('STDERR:', error.stderr.toString());
    process.exit(1);
}
