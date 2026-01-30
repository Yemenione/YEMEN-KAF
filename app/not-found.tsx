"use client";

import Link from "next/link";
import { MoveLeft } from "lucide-react";

export default function RootNotFound() {
    return (
        <html lang="en">
            <body className="bg-white">
                <main className="min-h-screen flex items-center justify-center px-6">
                    <div className="max-w-md w-full text-center space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-6xl font-serif text-black opacity-10 italic">404</h1>
                            <h2 className="text-2xl font-serif text-black uppercase tracking-widest">Page Non Trouvée</h2>
                            <p className="text-gray-500 font-light italic">
                                La page que vous recherchez semble s'être égarée dans les sables du temps.
                            </p>
                        </div>

                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-all font-bold uppercase tracking-widest text-[10px]"
                        >
                            <MoveLeft size={14} />
                            Retour à l'Accueil
                        </Link>
                    </div>
                </main>
            </body>
        </html>
    );
}
