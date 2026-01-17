"use client";

import ProductForm from "../ProductForm";

export default function NewProductPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Add New Product</h1>
                <p className="text-gray-500">Create a new item in your inventory</p>
            </div>
            <ProductForm />
        </div>
    );
}
