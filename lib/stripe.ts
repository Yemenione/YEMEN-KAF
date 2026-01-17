import { loadStripe } from "@stripe/stripe-js";

let stripePromise: Promise<any> | null = null;
let currentKey: string | null = null;

export const getStripe = (customKey?: string) => {
    const key = customKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!key) {
        console.warn("Stripe Publishable Key is missing.");
        return null;
    }

    if (!stripePromise || currentKey !== key) {
        currentKey = key;
        stripePromise = loadStripe(key);
    }

    return stripePromise;
};
