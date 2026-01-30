
/**
 * Resolves a product image source into a valid URL or path.
 * Handles JSON strings, absolute paths, legacy filenames, and external URLs.
 * Also supports objects (products/categories) passed directly.
 */
export const getMainImage = (imgSrc: unknown): string => {
    try {
        if (!imgSrc) return '/images/honey-jar.jpg';

        // Support for objects (categories/products) passed directly
        if (typeof imgSrc === 'object' && imgSrc !== null && !Array.isArray(imgSrc)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const anyImg = imgSrc as any;
            const source = anyImg.images || anyImg.image_url || anyImg.imageUrl || anyImg.image;
            if (source) return getMainImage(source);
        }

        // If it's already an array, return the first item
        if (Array.isArray(imgSrc)) {
            return imgSrc.length > 0 ? imgSrc[0] : '/images/honey-jar.jpg';
        }

        // Check if it's already a clean URL (legacy/csv import support)
        if (typeof imgSrc === 'string' && (imgSrc.startsWith('http') || imgSrc.startsWith('/'))) {
            return imgSrc;
        }

        // Try parsing as JSON (WooCommerce often returns JSON strings for images)
        if (typeof imgSrc === 'string' && (imgSrc.startsWith('[') || imgSrc.startsWith('{'))) {
            const parsed = JSON.parse(imgSrc);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
            if (typeof parsed === 'string') return parsed;
        }

        // Support for bare filenames (e.g., "my-image.jpg")
        if (typeof imgSrc === 'string' && imgSrc.length > 0 && !imgSrc.includes('/')) {
            if (imgSrc.endsWith('.jpg') || imgSrc.endsWith('.png') || imgSrc.endsWith('.webp')) {
                return `/images/products/${imgSrc}`;
            }
        }
    } catch {
        // Fallback for non-JSON strings that might just be paths
        if (typeof imgSrc === 'string' && imgSrc.length > 0) {
            if (imgSrc.startsWith('http') || imgSrc.startsWith('/')) return imgSrc;
        }
    }
    return '/images/honey-jar.jpg';
};

/**
 * Resolves all product images into an array of valid URLs or paths.
 */
export const getAllImages = (imgSrc: unknown): string[] => {
    try {
        if (!imgSrc) return ['/images/honey-jar.jpg'];

        // Support for objects
        if (typeof imgSrc === 'object' && imgSrc !== null && !Array.isArray(imgSrc)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const anyImg = imgSrc as any;
            const source = anyImg.images || anyImg.image_url || anyImg.imageUrl || anyImg.image;
            if (source) return getAllImages(source);
        }

        // If it's already an array
        if (Array.isArray(imgSrc)) {
            return imgSrc.length > 0 ? imgSrc : ['/images/honey-jar.jpg'];
        }

        // Try parsing as JSON
        if (typeof imgSrc === 'string' && (imgSrc.startsWith('[') || imgSrc.startsWith('{'))) {
            const parsed = JSON.parse(imgSrc);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            if (typeof parsed === 'string') return [parsed];
        }

        // Handle single string path
        if (typeof imgSrc === 'string' && imgSrc.length > 0) {
            if (imgSrc.startsWith('http') || imgSrc.startsWith('/')) return [imgSrc];
            if (imgSrc.endsWith('.jpg') || imgSrc.endsWith('.png') || imgSrc.endsWith('.webp')) {
                if (!imgSrc.includes('/')) return [`/images/products/${imgSrc}`];
            }
            return [imgSrc];
        }
    } catch {
        if (typeof imgSrc === 'string' && imgSrc.length > 0) {
            if (imgSrc.startsWith('http') || imgSrc.startsWith('/')) return [imgSrc];
            return [`/images/products/${imgSrc}`];
        }
    }
    return ['/images/honey-jar.jpg'];
};
