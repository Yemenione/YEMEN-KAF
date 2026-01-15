"use client";

import { Plus, Edit2, Trash2 } from "lucide-react";

export default function AddressesPage() {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-serif text-black mb-2">My Addresses</h1>
                    <p className="text-gray-500">Manage your shipping and billing locations.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 border border-black text-black uppercase tracking-widest text-xs font-bold hover:bg-black hover:text-white transition-colors">
                    <Plus size={16} /> Add New Address
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Default Address */}
                <div className="p-6 border border-black bg-gray-50 relative group">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-white rounded-full text-gray-600 transition-colors"><Edit2 size={14} /></button>
                        <button className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"><Trash2 size={14} /></button>
                    </div>

                    <span className="inline-block px-2 py-1 bg-black text-white text-[10px] uppercase font-bold tracking-wider mb-4">Default Shipping</span>

                    <h3 className="font-serif text-lg mb-2">Home (Sana'a)</h3>
                    <div className="text-sm text-gray-500 space-y-1">
                        <p>Ali Latif</p>
                        <p>Haddah Street, Near Yemen Mall</p>
                        <p>Sana'a, Yemen</p>
                        <p>+967 71 234 5678</p>
                    </div>
                </div>

                {/* Secondary Address */}
                <div className="p-6 border border-gray-100 hover:border-gray-300 transition-colors relative group">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"><Edit2 size={14} /></button>
                        <button className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"><Trash2 size={14} /></button>
                    </div>

                    <h3 className="font-serif text-lg mb-2">Office (Dubai)</h3>
                    <div className="text-sm text-gray-500 space-y-1">
                        <p>Ali Latif</p>
                        <p>Business Bay, Tower B, Floor 12</p>
                        <p>Dubai, UAE</p>
                        <p>+971 50 123 4567</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
