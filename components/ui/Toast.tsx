"use client";

import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => setIsVisible(true));

        const timer = setTimeout(() => {
            setIsVisible(false);
            // Wait for exit animation to finish before removing from DOM
            setTimeout(onClose, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColors = {
        success: "bg-black text-white",
        error: "bg-red-600 text-white",
        info: "bg-gray-800 text-white"
    };

    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <AlertCircle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />
    };

    return (
        <div
            className={`fixed bottom-6 right-6 md:top-24 md:bottom-auto z-[9999] flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl transition-all duration-300 ease-out transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                } ${bgColors[type]}`}
        >
            {icons[type]}
            <p className="font-medium text-sm tracking-wide">{message}</p>
            <button onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }} className="ml-2 hover:opacity-75">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
