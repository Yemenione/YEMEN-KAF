import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding The Farms page...');

    const content = `
    <div className="max-w-6xl mx-auto space-y-20 py-16 px-6 font-serif text-[var(--coffee-brown)]" dir="rtl">
        
        {/* Header */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
            <span className="text-[var(--honey-gold)] text-sm font-bold uppercase tracking-widest block">أرض الخيرات</span>
            <h1 className="text-5xl md:text-7xl font-bold text-[var(--coffee-brown)]">مزارعنا: من الأرض إلى القلب</h1>
            <p className="text-xl leading-relaxed text-[var(--coffee-brown)]/80">
                اليمن، الأرض السعيدة، حيث الطبيعة العذراء والتربة الخصبة. نأخذكم في رحلة إلى حيث تنمو أجود المحاصيل، بعناية المزارع اليمني وحب الأرض.
            </p>
        </div>

        {/* Region 1: Do'an Valley (Honey) */}
        <div className="grid md:grid-cols-2 gap-12 items-center bg-gray-50 rounded-3xl overflow-hidden p-8 md:p-12 shadow-sm">
            <div className="space-y-6 order-2 md:order-1">
                <div className="flex items-center gap-2 text-[var(--honey-gold)]">
                     <span className="font-bold">وادي دوعن، حضرموت</span>
                </div>
                <h2 className="text-4xl font-bold text-[var(--coffee-brown)] leading-tight">وادي العسل الفاخر</h2>
                <p className="leading-loose text-lg text-gray-700">
                    هنا، في بطن <strong>وادي دوعن</strong> الشهير، حيث تتفتح أزهار السدر (العلب). يتغذى النحل على رحيق هذه الأشجار المباركة لينتج لنا <strong>العسل الدوعني</strong> الأصلي، المعروف عالمياً بجودته وخصائصه العلاجية الفريدة.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>عسل سدر ملكي فاخر</li>
                    <li>طبيعي 100% وخالي من الإضافات</li>
                    <li>مذاق لا يُنسى وفوائد صحية جمّة</li>
                </ul>
            </div>
            <div className="order-1 md:order-2 h-80 relative rounded-2xl overflow-hidden shadow-lg">
                <img src="/images/honey-comb.jpg" alt="وادي دوعن إنتاج العسل" className="object-cover w-full h-full hover:scale-105 transition-transform duration-700" />
            </div>
        </div>

        {/* Region 2: Haraz Mountains (Coffee) */}
        <div className="grid md:grid-cols-2 gap-12 items-center bg-[var(--coffee-brown)] text-white rounded-3xl overflow-hidden p-8 md:p-12 shadow-xl">
             <div className="h-80 relative rounded-2xl overflow-hidden shadow-lg">
                <img src="/images/coffee-beans.jpg" alt="جبال حراز زراعة البن" className="object-cover w-full h-full hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-[var(--honey-gold)]">
                     <span className="font-bold">جبال حراز، صنعاء</span>
                </div>
                <h2 className="text-4xl font-bold text-white leading-tight">موطن البن الأصيل</h2>
                <p className="leading-loose text-lg text-white/90">
                    على قمم <strong>جبال حراز</strong> الشاهقة، وعبر المدرجات الزراعية المعلقة بالسحاب، يُزرع <strong>البن اليمني</strong> (الموكا) منذ قرون. مناخ مثالي وارتفاع شاهق يمنح حبات البن نكهة معقدة وغنية لا مثيل لها في العالم.
                </p>
                <ul className="list-disc list-inside text-white/80 space-y-2">
                    <li>بن يمني مختص فاخر</li>
                    <li>محمص بعناية للحفاظ على النكهة</li>
                    <li>تراث زراعي عريق يمتد لآلاف السنين</li>
                </ul>
            </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-12">
            <p className="text-2xl font-serif text-[var(--coffee-brown)] mb-6">تذوق الفرق. تذوق اليمن.</p>
        </div>

    </div>
    `;

    const page = await prisma.page.upsert({
        where: { slug: 'the-farms' },
        update: {
            title: 'مزارعنا - The Farms',
            content: content,
            structured_content: {
                hero: {
                    title: "مزارعنا: من الأرض إلى القلب",
                    subtitle: "اليمن، الأرض السعيدة، حيث الطبيعة العذراء والتربة الخصبة. نأخذكم في رحلة إلى حيث تنمو أجود المحاصيل، بعناية المزارع اليمني وحب الأرض.",
                    tagline: "أرض الخيرات"
                },
                sections: [
                    {
                        type: "region",
                        title: "وادي العسل الفاخر",
                        subtitle: "وادي دوعن، حضرموت",
                        content: "هنا، في بطن وادي دوعن الشهير، حيث تتفتح أزهار السدر (العلب). يتغذى النحل على رحيق هذه الأشجار المباركة لينتج لنا العسل الدوعني الأصلي، المعروف عالمياً بجودته وخصائصه العلاجية الفريدة.",
                        image: "/images/honey-comb.jpg",
                        features: [
                            "عسل سدر ملكي فاخر",
                            "طبيعي 100% وخالي من الإضافات",
                            "مذاق لا يُنسى وفوائد صحية جمّة"
                        ],
                        theme: "light"
                    },
                    {
                        type: "region",
                        title: "موطن البن الأصيل",
                        subtitle: "جبال حراز، صنعاء",
                        content: "على قمم جبال حراز الشاهقة، وعبر المدرجات الزراعية المعلقة بالسحاب، يُزرع البن اليمني (الموكا) منذ قرون. مناخ مثالي وارتفاع شاهق يمنح حبات البن نكهة معقدة وغنية لا مثيل لها في العالم.",
                        image: "/images/coffee-beans.jpg",
                        features: [
                            "بن يمني مختص فاخر",
                            "محمص بعناية للحفاظ على النكهة",
                            "تراث زراعي عريق يمتد لآلاف السنين"
                        ],
                        theme: "dark"
                    }
                ],
                cta: "تذوق الفرق. تذوق اليمن."
            },
            metaTitle: 'مزارعنا | وادي دوعن وجبال حراز - متجر يمني',
            metaDescription: 'اكتشف مصادر منتجاتنا. عسل السدر من وادي دوعن، والبن المختص من جبال حراز. جودة نضمنها من المزرعة إليك.',
            isActive: true
        },
        create: {
            title: 'مزارعنا - The Farms',
            slug: 'the-farms',
            content: content,
            structured_content: {
                hero: {
                    title: "مزارعنا: من الأرض إلى القلب",
                    subtitle: "اليمن، الأرض السعيدة، حيث الطبيعة العذراء والتربة الخصبة. نأخذكم في رحلة إلى حيث تنمو أجود المحاصيل، بعناية المزارع اليمني وحب الأرض.",
                    tagline: "أرض الخيرات"
                },
                sections: [
                    {
                        type: "region",
                        title: "وادي العسل الفاخر",
                        subtitle: "وادي دوعن، حضرموت",
                        content: "هنا، في بطن وادي دوعن الشهير، حيث تتفتح أزهار السدر (العلب). يتغذى النحل على رحيق هذه الأشجار المباركة لينتج لنا العسل الدوعني الأصلي، المعروف عالمياً بجودته وخصائصه العلاجية الفريدة.",
                        image: "/images/honey-comb.jpg",
                        features: [
                            "عسل سدر ملكي فاخر",
                            "طبيعي 100% وخالي من الإضافات",
                            "مذاق لا يُنسى وفوائد صحية جمّة"
                        ],
                        theme: "light"
                    },
                    {
                        type: "region",
                        title: "موطن البن الأصيل",
                        subtitle: "جبال حراز، صنعاء",
                        content: "على قمم جبال حراز الشاهقة، وعبر المدرجات الزراعية المعلقة بالسحاب، يُزرع البن اليمني (الموكا) منذ قرون. مناخ مثالي وارتفاع شاهق يمنح حبات البن نكهة معقدة وغنية لا مثيل لها في العالم.",
                        image: "/images/coffee-beans.jpg",
                        features: [
                            "بن يمني مختص فاخر",
                            "محمص بعناية للحفاظ على النكهة",
                            "تراث زراعي عريق يمتد لآلاف السنين"
                        ],
                        theme: "dark"
                    }
                ],
                cta: "تذوق الفرق. تذوق اليمن."
            },
            metaTitle: 'مزارعنا | وادي دوعن وجبال حراز - متجر يمني',
            metaDescription: 'اكتشف مصادر منتجاتنا. عسل السدر من وادي دوعن، والبن المختص من جبال حراز. جودة نضمنها من المزرعة إليك.',
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
