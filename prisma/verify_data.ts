import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const productCount = await prisma.product.count()
    const categoryCount = await prisma.category.count()
    console.log(`Verification: Found ${productCount} products and ${categoryCount} categories.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
