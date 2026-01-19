const config: import('tailwindcss').Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                'coffee-brown': '#0A0A0A',
                'honey-gold': '#737373',
                'cream-white': '#FFFFFF',
                'metallic-gold': '#A3A3A3',
            },
        },
    },
    plugins: [],
};

export default config;
