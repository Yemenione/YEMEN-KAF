const { execSync } = require('child_process');

console.log("🚀 Starting Safe Prisma Build...");
console.log("Config: Forcing Binary Engine to avoid Memory/Wasm errors.");

// Force CLI to use binary instead of Wasm
process.env.PRISMA_CLI_QUERY_ENGINE_TYPE = 'binary';
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'binary';

try {
    execSync('npx prisma generate', { stdio: 'inherit', env: process.env });
    console.log("✅ Prisma Client built successfully!");
} catch (error) {
    console.error("❌ Build failed:", error.message);
    process.exit(1);
}
