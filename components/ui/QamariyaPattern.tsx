export default function QamariyaPattern() {
    return (
        <div className="absolute inset-0 pointer-events-none -z-20 overflow-hidden opacity-5">
            <svg className="w-full h-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="qamariya" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                        {/* Stylized Geometric Qamariya Pattern */}
                        <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="none" stroke="#D4AF37" strokeWidth="1" />
                        <circle cx="50" cy="50" r="20" fill="none" stroke="#D4AF37" strokeWidth="1" />
                        <path d="M50 20 L80 50 L50 80 L20 50 Z" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
                        <circle cx="50" cy="50" r="5" fill="#D4AF37" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#qamariya)" />
            </svg>

            {/* Radial fade to keep focus in center */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent to-[var(--cream-white)]/90"></div>
        </div>
    );
}
