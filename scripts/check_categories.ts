import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const categories = await prisma.category.findMany({
        take: 10,
        include: { _count: { select: { products: true } } }
    })
    console.log(JSON.stringify(categories, null, 2))
}

main()
    .catch((e) => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
