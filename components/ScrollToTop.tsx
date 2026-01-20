'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
    const pathname = usePathname();

    useEffect(() => {
        // Force scroll to top on page load/refresh
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);

            // Also disable browser's scroll restoration to prevent it from jumping back down
            if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
            }
        }
    }, []); // Run once on mount

    useEffect(() => {
        // Also scroll to top on route change
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}
