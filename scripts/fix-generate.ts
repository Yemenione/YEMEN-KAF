import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

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

interface ExecError {
    stdout?: Buffer | string;
    stderr?: Buffer | string;
}

try {
    console.log('Running: npx prisma generate...');
    execSync('npx prisma generate', {
        stdio: 'inherit',
        env: process.env as NodeJS.ProcessEnv // Explicitly pass env
    });
    console.log('SUCCESS: Prisma Client generated.');
} catch (error: unknown) {
    console.error('FAILURE: Prisma Client generation failed.');
    if (typeof error === 'object' && error !== null) {
        const execErr = error as ExecError;
        if (execErr.stdout) console.log('STDOUT:', execErr.stdout.toString());
        if (execErr.stderr) console.log('STDERR:', execErr.stderr.toString());
    }
    process.exit(1);
}
