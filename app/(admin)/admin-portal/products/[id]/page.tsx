"use client";

import { useEffect, useState, use } from "react";
import ProductForm from "../ProductForm";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${id}`);
                const data = await res.json();
                if (data.product) {
                    setProduct(data.product);
                }
            } catch (error) {
                console.error("Failed to load product", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!product) return <div>Product not found</div>;

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Edit Product</h1>
                <p className="text-gray-500">Update product details and inventory</p>
            </div>
            <ProductForm initialData={product} isEdit />
        </div>
    );
}
