import { loadStripe } from "@stripe/stripe-js";

let stripePromise: Promise<any> | null = null;

export const getStripe = () => {
    if (!stripePromise) {
        const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (key) {
            stripePromise = loadStripe(key);
        } else {
            console.warn("Stripe Publishable Key is missing in environment variables.");
            return null;
        }
    }
    return stripePromise;
};
