"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ShoppingBag, Check, ShieldCheck, MapPin, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface Product {
    id: number;
    name: string;
    price: number;
    slug: string;
    image_url: string;
    description: string;
    category_name: string;
    stock_quantity: number;
}

export default function ProductPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { addToCart } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetchProduct();
    }, [slug]);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`/api/products/${slug}`);
            if (res.ok) {
                const data = await res.json();
                setProduct(data.product);
            }
        } catch (err) {
            console.error('Failed to fetch product', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Product not found</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-white pt-24">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Image */}
                    <div className="relative aspect-square bg-gray-100">
                        <Image
                            src={product.image_url || '/images/honey-jar.jpg'}
                            alt={product.name}
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Product Info */}
                    <div className="space-y-8">
                        <div>
                            <p className="text-sm uppercase tracking-wider text-gray-500 mb-2">
                                {product.category_name}
                            </p>
                            <h1 className="text-4xl md:text-5xl font-serif text-black mb-4">
                                {product.name}
                            </h1>
                            <p className="text-3xl font-bold text-black">
                                ${product.price}
                            </p>
                        </div>

                        <p className="text-gray-600 leading-relaxed">
                            {product.description}
                        </p>

                        {/* Quantity & Add to Cart */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <label className="text-sm uppercase tracking-wider text-gray-500">
                                    Quantity:
                                </label>
                                <div className="flex items-center border border-gray-300">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-4 py-2 hover:bg-gray-100"
                                    >
                                        -
                                    </button>
                                    <span className="px-6 py-2 border-x border-gray-300">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="px-4 py-2 hover:bg-gray-100"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => addToCart({
                                    id: product.id,
                                    title: product.name,
                                    price: product.price,
                                    image: product.image_url || '/images/honey-jar.jpg'
                                })}
                                className="w-full bg-black text-white py-4 uppercase tracking-wider font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                            >
                                <ShoppingBag size={20} />
                                Add to Cart
                            </button>
                        </div>

                        {/* Features */}
                        <div className="border-t border-gray-200 pt-8 space-y-4">
                            <div className="flex items-center gap-3 text-gray-700">
                                <Check size={20} className="text-green-600" />
                                <span>100% Authentic</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <ShieldCheck size={20} className="text-green-600" />
                                <span>Quality Guaranteed</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <Truck size={20} className="text-green-600" />
                                <span>Free Shipping on orders over $150</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
