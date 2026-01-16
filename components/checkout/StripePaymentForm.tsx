"use client";

import { useState, useEffect } from "react";
import {
    PaymentElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";
import { useLanguage } from "@/context/LanguageContext";

export default function StripePaymentForm({ amount, onSuccess, isFormValid = true }: { amount: number, onSuccess: (paymentIntentId: string) => void, isFormValid?: boolean }) {
    const stripe = useStripe();
    const elements = useElements();
    const { t } = useLanguage();

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!stripe) {
            return;
        }

        const clientSecret = new URLSearchParams(window.location.search).get(
            "payment_intent_client_secret"
        );

        if (!clientSecret) {
            return;
        }

        stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
            switch (paymentIntent?.status) {
                case "succeeded":
                    setMessage("Payment succeeded!");
                    break;
                case "processing":
                    setMessage("Your payment is processing.");
                    break;
                case "requires_payment_method":
                    setMessage("Your payment was not successful, please try again.");
                    break;
                default:
                    setMessage("Something went wrong.");
                    break;
            }
        });
    }, [stripe]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        if (!isFormValid) {
            setMessage("Please fill in all shipping details first.");
            return;
        }

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL where the user should be redirected after the payment.
                // For now, handling inline or redirecting to confirmation page.
                return_url: `${window.location.origin}/checkout/confirm`,
            },
            redirect: "if_required", // Prevent redirect if not 3DS
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message || "An unexpected error occurred.");
            } else {
                setMessage("An unexpected error occurred.");
            }
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            onSuccess(paymentIntent.id);
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
            {message && <div id="payment-message" className="text-red-500 text-sm">{message}</div>}

            <button
                disabled={isLoading || !stripe || !elements || !isFormValid}
                id="submit"
                className="w-full py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-800 transition-all rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (t('checkout.processing') || "Processing...") : `${t('checkout.payNow') || "Pay Now"} ${amount.toFixed(2)}€`}
            </button>
        </form>
    );
}
