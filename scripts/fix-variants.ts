
import { prisma } from '@/lib/prisma';

async function main() {
    console.log('🔧 Fixing Corn Variants...');

    // 1. Get Attributes and Values
    const attributes = await prisma.attribute.findMany({
        include: { values: true }
    });

    // Create lookup map: "Red" -> ValueID, "S" -> ValueID
    const valueMap = new Map<string, number>();
    attributes.forEach(attr => {
        attr.values.forEach(val => {
            valueMap.set(val.name.toLowerCase(), val.id);
        });
    });

    // 2. Get Corn Product and Variants
    const product = await prisma.product.findFirst({
        where: { slug: 'corn' },
        include: { variants: true }
    });

    if (!product) {
        console.log('❌ Product "corn" not found');
        return;
    }

    console.log(`✅ Found Corn (ID: ${product.id}) with ${product.variants.length} variants`);

    // 3. Loop variants and link attributes based on Name
    for (const v of product.variants) {
        // Name is likely "Red", "Blue - S", etc.
        const parts = v.name.split(' - ').map(p => p.trim());

        console.log(`   Processing: ${v.name}`);
        const valuesToLink: number[] = [];

        for (const part of parts) {
            const valId = valueMap.get(part.toLowerCase());
            if (valId) {
                valuesToLink.push(valId);
                console.log(`     -> Matched "${part}" to ID ${valId}`);
            } else {
                console.log(`     ⚠️ No match for "${part}"`);
            }
        }

        if (valuesToLink.length > 0) {
            // Delete existing links to be safe
            await prisma.productVariantValue.deleteMany({
                where: { variantId: v.id }
            });

            // Create new links
            await prisma.productVariantValue.createMany({
                data: valuesToLink.map(valId => ({
                    variantId: v.id,
                    attributeValueId: valId
                }))
            });
            console.log(`     ✅ Linked ${valuesToLink.length} attributes`);
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
