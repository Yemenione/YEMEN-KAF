"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Brand {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
}

export default function FeaturedBrands() {
    const [brands, setBrands] = useState<Brand[]>([]);

    useEffect(() => {
        fetch('/api/brands')
            .then(res => res.json())
            .then(data => {
                if (data.brands) setBrands(data.brands);
            })
            .catch(err => console.error(err));
    }, []);

    if (brands.length === 0) return null;

    return (
        <section className="py-8 bg-white border-t border-black/5">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-2xl font-serif text-black mb-6 text-center">Nos Marques Partenaires</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-80 hover:opacity-100 transition-opacity">
                    {brands.map(brand => (
                        <Link key={brand.id} href={`/search?brand=${brand.slug}`} className="group relative w-full max-w-[180px] h-24 grayscale hover:grayscale-0 transition-all duration-500">
                            {brand.logo ? (
                                <Image
                                    src={brand.logo}
                                    alt={brand.name}
                                    fill
                                    className="object-contain p-2"
                                    sizes="(max-width: 768px) 33vw, 15vw"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center border border-dashed rounded text-xs text-gray-400">
                                    {brand.name}
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
