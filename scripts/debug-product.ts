
import { prisma } from '@/lib/prisma';

async function main() {
    const slug = 'corn'; // or whatever the user is looking at
    console.log(`🔍 Inspecting Product: ${slug}`);

    const product = await prisma.product.findFirst({
        where: { slug: slug },
        include: {
            variants: {
                include: {
                    attributeValues: {
                        include: {
                            attributeValue: {
                                include: {
                                    attribute: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!product) {
        console.log('❌ Product not found');
        return;
    }

    console.log(`✅ Found Product: ${product.name} (ID: ${product.id})`);
    console.log(`   Variants Count: ${product.variants.length}`);

    product.variants.forEach(v => {
        console.log(`   - Variant: ${v.name} (SKU: ${v.sku}, Active: ${v.isActive})`);
        v.attributeValues.forEach(av => {
            console.log(`     - Attr: ${av.attributeValue.attribute.name} = ${av.attributeValue.name}`);
        });
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
