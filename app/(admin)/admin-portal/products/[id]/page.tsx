"use client";

import { use, useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import ProductForm from "../ProductForm";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { t } = useLanguage();
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

    if (loading) return <div className="p-8 text-center">{t('admin.common.loading')}</div>;
    if (!product) return <div className="p-8 text-center">{t('shop.productNotFound')}</div>;

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">{t('admin.products.form.editProduct')}</h1>
                <p className="text-gray-500">{t('admin.products.form.subtitle')}</p>
            </div>
            <ProductForm initialData={product} isEdit />
        </div>
    );
}
