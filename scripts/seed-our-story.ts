import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Our Story page...');

    const content = `
    <div className="max-w-4xl mx-auto space-y-12 py-12 px-6 font-serif text-[var(--coffee-brown)]" dir="rtl">
        
        {/* Hero / Intro */}
        <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--coffee-brown)]">قصتنا: متجر يمني للأصالة في أوروبا</h1>
            <p className="text-xl leading-relaxed text-[var(--coffee-brown)]/80">
                نحن أكثر من مجرد متجر؛ نحن جسر يربطك برائحة الوطن وعبق التاريخ. <strong>متجر يمني</strong> تأسس لخدمة الجالية اليمنية والعربية في أوروبا، لنحضر لكم أجود المنتجات اليمنية الأصلية من قلب اليمن السعيد إلى باب منزلك.
            </p>
        </div>

        {/* Section 1: Our Mission */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1 relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-xl">
                 <img src="/images/honey-comb.jpg" alt="العسل اليمني الأصلي" className="object-cover w-full h-full hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="order-1 md:order-2 space-y-4">
                <h2 className="text-3xl font-bold text-[var(--honey-gold)]">لماذا نحن؟</h2>
                <p className="leading-loose text-lg">
                    في غربتنا، نشتاق لتلك التفاصيل الصغيرة التي تصنع فرقاً كبيراً في يومنا. رائحة <strong>القهوة اليمنية</strong> في الصباح، طعم <strong>العسل الدوعني</strong> الشافي، ودفء <strong>الملابس التقليدية</strong> التي تحكي قصص أجدادنا.
                    هنا نوفر لكم كل ما تحتاجونه من <strong>حلبه</strong>، <strong>بن يمني فاخر</strong>، <strong>توابل وبهارات</strong>، وأزياء تعكس هويتنا العريقة.
                </p>
            </div>
        </div>

        {/* Section 2: Products SEO Focused */}
        <div className="bg-[var(--coffee-brown)]/5 rounded-3xl p-8 md:p-12 space-y-8">
            <h2 className="text-3xl font-bold text-center">منتجاتنا: جودة لا تضاهى</h2>
            <div className="grid md:grid-cols-3 gap-6 text-center">
                
                <div className="bg-white p-6 rounded-xl shadow-md space-y-3">
                    <h3 className="text-xl font-bold text-[var(--coffee-brown)]">العسل اليمني والحلبه</h3>
                    <p className="text-sm text-gray-600">
                        نقدم لكم <strong>أجود أنواع العسل اليمني</strong> (سدر، سمر) و<strong>الحلبه</strong> الصصافية، المعروفة بفوائدها الصحية العظيمة ومذاقها الفريد.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md space-y-3">
                    <h3 className="text-xl font-bold text-[var(--coffee-brown)]">الملابس التقليدية</h3>
                    <p className="text-sm text-gray-600">
                        تشكيلة واسعة من <strong>الأزياء اليمنية التقليدية</strong> للرجال والنساء والأطفال. (ثوب، جنبية، شال) لتتزينوا بهويتكم في كل المناسبات.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md space-y-3">
                    <h3 className="text-xl font-bold text-[var(--coffee-brown)]">البن والمكسرات</h3>
                    <p className="text-sm text-gray-600">
                        لا تكتمل الجلسة بدون <strong>القهوة اليمنية</strong> (البن) والمكسرات الطازجة. استمتعوا بمذاق الأصالة والجودة العالية.
                    </p>
                </div>

            </div>
        </div>

        {/* Conclusion */}
        <div className="text-center space-y-6 pt-8">
            <h2 className="text-2xl font-bold">رؤيتنا</h2>
            <p className="max-w-2xl mx-auto leading-loose">
                نسعى لأن نكون المرجع الأول لكل يمني وعربي في أوروبا يبحث عن الجودة والأصالة. نلتزم بتوفير <strong>منتجات يمنية طبيعية 100%</strong>، ونضمن لكم تجربة تسوق سهلة وممتعة مع توصيل سريع ومضمون.
            </p>
            <p className="text-lg font-bold text-[var(--honey-gold)]">شكراً لثقتكم بنا.</p>
        </div>

    </div>
    `;

    const page = await prisma.page.upsert({
        where: { slug: 'our-story' },
        update: {
            title: 'قصتنا - Our Story',
            content: content,
            structured_content: {
                hero: {
                    title: "قصتنا: متجر يمني للأصالة في أوروبا",
                    subtitle: "نحن أكثر من مجرد متجر؛ نحن جسر يربطك برائحة الوطن وعبق التاريخ. متجر يمني تأسس لخدمة الجالية اليمنية والعربية في أوروبا، لنحضر لكم أجود المنتجات اليمنية الأصلية من قلب اليمن السعيد إلى باب منزلك.",
                    image: "/images/honey-comb.jpg"
                },
                sections: [
                    {
                        type: "image-text",
                        title: "لماذا نحن؟",
                        content: "في غربتنا، نشتاق لتلك التفاصيل الصغيرة التي تصنع فرقاً كبيراً في يومنا. رائحة القهوة اليمنية في الصباح، طعم العسل الدوعني الشافي، ودفء الملابس التقليدية التي تحكي قصص أجدادنا. هنا نوفر لكم كل ما تحتاجونه من حلبه، بن يمني فاخر، توابل وبهارات، وأزياء تعكس هويتنا العريقة.",
                        image: "/images/honey-comb.jpg",
                        imagePosition: "left"
                    },
                    {
                        type: "grid",
                        title: "منتجاتنا: جودة لا تضاهى",
                        items: [
                            { title: "العسل اليمني والحلبه", content: "نقدم لكم أجود أنواع العسل اليمني (سدر، سمر) والحلبه الصصافية، المعروفة بفوائدها الصحية العظيمة ومذاقها الفريد." },
                            { title: "الملابس التقليدية", content: "تشكيلة واسعة من الأزياء اليمنية التقليدية للرجال والنساء والأطفال. (ثوب، جنبية، شال) لتتزينوا بهويتكم في كل المناسبات." },
                            { title: "البن والمكسرات", content: "لا تكتمل الجلسة بدون القهوة اليمنية (البن) والمكسرات الطازجة. استمتعوا بمذاق الأصالة والجودة العالية." }
                        ]
                    }
                ],
                conclusion: {
                    title: "رؤيتنا",
                    content: "نسعى لأن نكون المرجع الأول لكل يمني وعربي في أوروبا يبحث عن الجودة والأصالة. نلتزم بتوفير منتجات يمنية طبيعية 100%، ونضمن لكم تجربة تسوق سهلة وممتعة مع توصيل سريع ومضمون."
                }
            },
            metaTitle: 'قصتنا | متجر يمني في أوروبا - منتجات يمنية أصلية',
            metaDescription: 'تعرف على قصتنا. نحن متجر يمني يوفر أجود المنتجات اليمنية في أوروبا: عسل، حلبه، ملابس تقليدية، بن يمني والمزيد. الجودة والأصالة شعارنا.',
            isActive: true
        },
        create: {
            title: 'قصتنا - Our Story',
            slug: 'our-story',
            content: content,
            structured_content: {
                hero: {
                    title: "قصتنا: متجر يمني للأصالة في أوروبا",
                    subtitle: "نحن أكثر من مجرد متجر؛ نحن جسر يربطك برائحة الوطن وعبق التاريخ. متجر يمني تأسس لخدمة الجالية اليمنية والعربية في أوروبا، لنحضر لكم أجود المنتجات اليمنية الأصلية من قلب اليمن السعيد إلى باب منزلك.",
                    image: "/images/honey-comb.jpg"
                },
                sections: [
                    {
                        type: "image-text",
                        title: "لماذا نحن؟",
                        content: "في غربتنا، نشتاق لتلك التفاصيل الصغيرة التي تصنع فرقاً كبيراً في يومنا. رائحة القهوة اليمنية في الصباح، طعم العسل الدوعني الشافي، ودفء الملابس التقليدية التي تحكي قصص أجدادنا. هنا نوفر لكم كل ما تحتاجونه من حلبه، بن يمني فاخر، توابل وبهارات، وأزياء تعكس هويتنا العريقة.",
                        image: "/images/honey-comb.jpg",
                        imagePosition: "left"
                    },
                    {
                        type: "grid",
                        title: "منتجاتنا: جودة لا تضاهى",
                        items: [
                            { title: "العسل اليمني والحلبه", content: "نقدم لكم أجود أنواع العسل اليمني (سدر، سمر) والحلبه الصصافية، المعروفة بفوائدها الصحية العظيمة ومذاقها الفريد." },
                            { title: "الملابس التقليدية", content: "تشكيلة واسعة من الأزياء اليمنية التقليدية للرجال والنساء والأطفال. (ثوب، جنبية، شال) لتتزينوا بهويتكم في كل المناسبات." },
                            { title: "البن والمكسرات", content: "لا تكتمل الجلسة بدون القهوة اليمنية (البن) والمكسرات الطازجة. استمتعوا بمذاق الأصالة والجودة العالية." }
                        ]
                    }
                ],
                conclusion: {
                    title: "رؤيتنا",
                    content: "نسعى لأن نكون المرجع الأول لكل يمني وعربي في أوروبا يبحث عن الجودة والأصالة. نلتزم بتوفير منتجات يمنية طبيعية 100%، ونضمن لكم تجربة تسوق سهلة وممتعة مع توصيل سريع ومضمون."
                }
            },
            metaTitle: 'قصتنا | متجر يمني في أوروبا - منتجات يمنية أصلية',
            metaDescription: 'تعرف على قصتنا. نحن متجر يمني يوفر أجود المنتجات اليمنية في أوروبا: عسل، حلبه، ملابس تقليدية، بن يمني والمزيد. الجودة والأصالة شعارنا.',
            isActive: true
        }
    });

    console.log('Seeded page:', page.title);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
