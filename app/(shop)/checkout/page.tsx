"use client";

import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CreditCard, ChevronRight, ShoppingBag, MapPin, Truck, Banknote, Coins, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { getStripe } from "@/lib/stripe";
import { Elements } from "@stripe/react-stripe-js";
import StripePaymentForm from "@/components/checkout/StripePaymentForm";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSettings } from "@/context/SettingsContext";

export default function CheckoutPage() {
    const { settings } = useSettings();
    const stripePromise = getStripe(settings.stripe_publishable_key);

    const { items, total, subtotal, taxTotal } = useCart();
    const { t } = useLanguage();
    const router = useRouter();
    const [selectedShippingMethod, setSelectedShippingMethod] = useState("standard");
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("stripe");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clientSecret, setClientSecret] = useState("");

    const [shippingRates, setShippingRates] = useState<any[]>([]);
    const [cartWeight, setCartWeight] = useState(0);
    const [selectedShippingRate, setSelectedShippingRate] = useState<any>(null);
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Coupon State
    const [couponCode, setCouponCode] = useState("");
    const [couponError, setCouponError] = useState("");
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    const handleApplyCoupon = async () => {
        setCouponError("");
        setIsApplyingCoupon(true);
        try {
            const res = await fetch('/api/cart/coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode, cartTotal: total })
            });
            const data = await res.json();
            if (res.ok) {
                setAppliedCoupon(data.coupon);
                setDiscountAmount(data.discountAmount);
                setCouponCode(data.coupon.code); // Format/normalize
            } else {
                setCouponError(data.error || "Invalid coupon");
                setAppliedCoupon(null);
                setDiscountAmount(0);
            }
        } catch (err) {
            setCouponError("Failed to apply coupon");
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const checkoutSchema = z.object({
        firstName: z.string().min(2, t('validation.firstNameRequired') || "First name is required"),
        lastName: z.string().min(2, t('validation.lastNameRequired') || "Last name is required"),
        email: z.string().email(t('validation.emailInvalid') || "Invalid email address"),
        phone: z.string().min(8, t('validation.phoneRequired') || "Phone number is required"),
        address: z.string().min(5, t('validation.addressRequired') || "Address is required"),
        city: z.string().min(2, t('validation.cityRequired') || "City is required"),
        state: z.string().min(2, t('validation.stateRequired') || "State/Province is required"),
        zip: z.string().min(4, t('validation.zipRequired') || "ZIP code is required"),
        country: z.string().min(2, t('validation.countryRequired') || "Country is required"),
    });

    type CheckoutFormValues = z.infer<typeof checkoutSchema>;

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        getValues,
        trigger,
        control
    } = useForm<CheckoutFormValues>({
        resolver: zodResolver(checkoutSchema),
        mode: "onChange",
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            state: "",
            zip: "",
            country: "France"
        }
    });

    // Watch country change to re-fetch rates
    const selectedCountry = useWatch({ control, name: "country" });

    useEffect(() => {
        if (items.length > 0 && selectedCountry) {
            fetch("/api/shipping/calculate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items, country: selectedCountry }),
            })
                .then((res) => res.json())
                .then((data) => {
                    setShippingRates(data.rates || []);
                    setCartWeight(data.totalWeight || 0);
                    // Default to first option if current selection is invalid or null
                    if (data.rates && data.rates.length > 0) {
                        // Keep current if exists in new list, else set first
                        setSelectedShippingRate((prev: any) => {
                            const exists = data.rates.find((r: any) => r.id === prev?.id);
                            return exists || data.rates[0];
                        });
                        setSelectedShippingMethod(data.rates[0].id); // Legacy support for string ID
                    } else {
                        setShippingRates([]);
                        setSelectedShippingRate(null);
                    }
                })
                .catch(err => console.error("Failed to fetch shipping rates", err));
        }
    }, [items, selectedCountry]);

    // Fetch saved addresses for logged-in users
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const res = await fetch('/api/account/addresses');
                if (res.ok) {
                    setIsAuthenticated(true);
                    const data = await res.json();

                    if (data.addresses && data.addresses.length > 0) {
                        setSavedAddresses(data.addresses);
                        // Auto-select default address if exists
                        const defaultAddr = data.addresses.find((a: any) => a.is_default);
                        if (defaultAddr) {
                            setSelectedAddressId(defaultAddr.id.toString());
                            fillFormWithAddress(defaultAddr);
                        } else {
                            // Or just select the first one? Or let user choose? 
                            // Let's force 'new' if no default, or maybe first one. Usually first one is better UX.
                            // But keeping existing logic:
                        }
                    } else {
                        // Logged in but no addresses: default to 'new' mode
                        setSavedAddresses([]);
                        setSelectedAddressId("new");
                    }
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.log('Not logged in or no addresses');
                setIsAuthenticated(false);
            }
        };
        fetchAddresses();
    }, []);

    // Fill form with selected address
    const fillFormWithAddress = (address: any) => {
        const names = (address.label || '').split(' ');
        const formData = {
            firstName: names[0] || '',
            lastName: names.slice(1).join(' ') || '',
            email: '', // Keep existing email
            phone: address.phone || '',
            address: address.street_address || '',
            city: address.city || '',
            state: address.state || '',
            zip: address.postal_code || '',
            country: address.country || 'France'
        };
        Object.entries(formData).forEach(([key, value]) => {
            if (value) {
                (document.querySelector(`[name="${key}"]`) as HTMLInputElement)?.setAttribute('value', value);
            }
        });
    };

    // Handle address selection
    const handleAddressSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const addressId = e.target.value;
        setSelectedAddressId(addressId);
        if (addressId === 'new') {
            // Clear form for new address
            return;
        }
        const address = savedAddresses.find(a => a.id.toString() === addressId);
        if (address) {
            fillFormWithAddress(address);
        }
    };

    const orderTotal = Math.max(0, (total + (selectedShippingRate?.price || 0)) - discountAmount);

    // Redirect if cart is empty
    useEffect(() => {
        if (items.length === 0) {
            router.push("/shop");
        }
    }, [items, router]);

    // Create PaymentIntent as soon as the page loads OR total changes
    useEffect(() => {
        // Only create intent if order total > 0 AND checking out with Stripe
        // Also don't retry if we know it failed due to configuration (optional optimization)
        if (orderTotal > 0 && selectedPaymentMethod === "stripe") {
            const timeoutId = setTimeout(() => {
                fetch("/api/stripe/create-payment-intent", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount: orderTotal, currency: "eur" }),
                })
                    .then(async (res) => {
                        if (!res.ok) {
                            const err = await res.json();
                            console.warn("Stripe unavailable:", err);
                            return null;
                        }
                        return res.json();
                    })
                    .then((data) => {
                        if (data?.clientSecret) {
                            setClientSecret(data.clientSecret);
                        }
                    })
                    .catch(err => console.error("Failed to init Stripe:", err));
            }, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [orderTotal, selectedPaymentMethod]);

    const formatPrice = (price: string | number) => {
        if (typeof price === 'number') return `${price.toFixed(2)}€`;
        return price;
    };

    const handlePlaceOrder = async (paymentId?: string) => {
        console.log("handlePlaceOrder initiated", { paymentMethod: selectedPaymentMethod, paymentId });

        // Validate form one last time if called manually
        const isFormValid = await trigger();
        console.log("Form validation result:", isFormValid, errors);

        if (!isFormValid) {
            const errorFields = Object.keys(errors).join(", ");
            alert(`Please correct the errors in the following fields: ${errorFields}`);
            return;
        }

        const formData = getValues();
        console.log("Submitting order with data:", formData);

        setIsSubmitting(true);
        try {
            // Check if "Save Address" is checked
            const saveAddressCheckbox = document.getElementById('save-address') as HTMLInputElement;
            if ((selectedAddressId === 'new' || savedAddresses.length === 0) && saveAddressCheckbox && saveAddressCheckbox.checked) {
                try {
                    await fetch('/api/account/addresses', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            street: formData.address,
                            city: formData.city,
                            state: formData.state,
                            postalCode: formData.zip,
                            country: formData.country,
                            isDefault: savedAddresses.length === 0 // Make default if it's the first one
                        })
                    });
                    // Non-blocking catch, if it fails we still place order
                } catch (err) {
                    console.error("Failed to save address silently:", err);
                }
            }

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shippingAddress: formData,
                    paymentMethod: selectedPaymentMethod,
                    paymentId: paymentId || null, // Store Stripe Payment ID
                    shippingMethod: selectedShippingMethod,

                    items: items.map(item => ({ id: item.id, quantity: item.quantity })),
                    couponCode: appliedCoupon ? appliedCoupon.code : null // Send coupon code
                })
            });

            console.log("Order API response status:", res.status);

            if (res.ok) {
                const data = await res.json();
                router.push(`/order-confirmation/${data.orderNumber}`);
            } else {
                alert("Failed to place order. Please try again.");
            }
        } catch (error) {
            console.error("Checkout error:", error);
            alert("An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const appearance = {
        theme: 'stripe' as const,
        variables: {
            colorPrimary: '#000000',
        },
    };
    const options = {
        clientSecret,
        appearance,
    };

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Left Column: Checkout Forms */}
                <div className="lg:col-span-7 space-y-16">
                    {/* Header */}
                    <div className="space-y-4 border-b border-black/10 pb-8">
                        <Link href="/shop" className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition-colors text-xs uppercase tracking-widest font-medium">
                            <ArrowLeft size={14} /> {t('checkout.continueShopping')}
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-serif text-black">{t("checkout.title")}</h1>
                    </div>

                    {/* Step 1: Shipping */}
                    <section className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-medium tracking-wide flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white text-sm font-bold">1</span>
                                {t('checkout.shippingDetails')}
                            </h2>
                            <button
                                onClick={() => {
                                    if (navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition(() => {
                                            alert("Location Found! (Mock: Filled City/Country)");
                                            // In a real app, use Google Maps API or similar here
                                        }, () => alert("Location access denied."));
                                    }
                                }}
                                className="text-xs uppercase tracking-wider font-bold text-black border-b border-black pb-0.5 hover:text-gray-600 transition-colors flex items-center gap-1"
                            >
                                <MapPin size={12} /> {t('checkout.smartLocation')}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                            {/* Address Selector */}
                            {savedAddresses.length > 0 && (
                                <div className="md:col-span-2 mb-4">
                                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">{t('checkout.selectAddress')}</label>
                                    <select
                                        value={selectedAddressId}
                                        onChange={handleAddressSelect}
                                        className="w-full border-b border-gray-200 py-3 text-lg outline-none focus:border-black transition-colors bg-transparent appearance-none cursor-pointer"
                                    >
                                        <option value="new">{t('checkout.useNewAddress')}</option>
                                        {savedAddresses.map(addr => (
                                            <option key={addr.id} value={addr.id}>
                                                {addr.label || `${addr.street_address}, ${addr.city}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="group">
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-black transition-colors">{t('checkout.firstName')}</label>
                                <input {...register("firstName")} type="text" className={`w-full border-b py-3 text-lg outline-none transition-colors bg-transparent placeholder-gray-300 ${errors.firstName ? 'border-red-500' : 'border-gray-200 focus:border-black'}`} />
                                {errors.firstName && <span className="text-red-500 text-xs">{errors.firstName.message}</span>}
                            </div>
                            <div className="group">
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-black transition-colors">{t('checkout.lastName')}</label>
                                <input {...register("lastName")} type="text" className={`w-full border-b py-3 text-lg outline-none transition-colors bg-transparent placeholder-gray-300 ${errors.lastName ? 'border-red-500' : 'border-gray-200 focus:border-black'}`} />
                                {errors.lastName && <span className="text-red-500 text-xs">{errors.lastName.message}</span>}
                            </div>

                            <div className="md:col-span-2 group">
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-black transition-colors">{t('checkout.email')}</label>
                                <input {...register("email")} type="email" className={`w-full border-b py-3 text-lg outline-none transition-colors bg-transparent placeholder-gray-300 ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-black'}`} />
                                {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
                            </div>

                            <div className="md:col-span-2 group">
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-black transition-colors">{t('checkout.phone')}</label>
                                <input {...register("phone")} type="tel" className={`w-full border-b py-3 text-lg outline-none transition-colors bg-transparent placeholder-gray-300 ${errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-black'}`} />
                                {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
                            </div>

                            <div className="md:col-span-2 group">
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-black transition-colors">{t('checkout.street')}</label>
                                <input {...register("address")} type="text" className={`w-full border-b py-3 text-lg outline-none transition-colors bg-transparent placeholder-gray-300 ${errors.address ? 'border-red-500' : 'border-gray-200 focus:border-black'}`} />
                                {errors.address && <span className="text-red-500 text-xs">{errors.address.message}</span>}
                            </div>

                            <div className="group">
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-black transition-colors">{t('checkout.city')}</label>
                                <input {...register("city")} type="text" className={`w-full border-b py-3 text-lg outline-none transition-colors bg-transparent placeholder-gray-300 ${errors.city ? 'border-red-500' : 'border-gray-200 focus:border-black'}`} />
                                {errors.city && <span className="text-red-500 text-xs">{errors.city.message}</span>}
                            </div>
                            <div className="group">
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-black transition-colors">{t('checkout.state')}</label>
                                <input {...register("state")} type="text" className={`w-full border-b py-3 text-lg outline-none transition-colors bg-transparent placeholder-gray-300 ${errors.state ? 'border-red-500' : 'border-gray-200 focus:border-black'}`} />
                                {errors.state && <span className="text-red-500 text-xs">{errors.state.message}</span>}
                            </div>
                            <div className="group">
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-black transition-colors">{t('checkout.zip')}</label>
                                <input {...register("zip")} type="text" className={`w-full border-b py-3 text-lg outline-none transition-colors bg-transparent placeholder-gray-300 ${errors.zip ? 'border-red-500' : 'border-gray-200 focus:border-black'}`} />
                                {errors.zip && <span className="text-red-500 text-xs">{errors.zip.message}</span>}
                            </div>
                            <div className="group">
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-black transition-colors">{t('checkout.country')}</label>
                                <select {...register("country")} className={`w-full border-b py-3 text-lg outline-none transition-colors bg-transparent appearance-none cursor-pointer ${errors.country ? 'border-red-500' : 'border-gray-200 focus:border-black'}`}>
                                    <option value="">Select Country</option>
                                    <option value="France">France</option>
                                    <option value="United Kingdom">United Kingdom</option>
                                    <option value="United States">United States</option>
                                    <option value="UAE">UAE</option>
                                    <option value="Saudi Arabia">Saudi Arabia</option>
                                    <option value="Yemen">Yemen</option>
                                </select>
                                {errors.country && <span className="text-red-500 text-xs">{errors.country.message}</span>}
                            </div>

                            {/* Save Address Checkbox - Show when creating new address AND authenticated */}
                            {isAuthenticated && (selectedAddressId === 'new' || savedAddresses.length === 0) && (
                                <div className="md:col-span-2 flex items-center gap-2 mt-2">
                                    <input
                                        type="checkbox"
                                        id="save-address"
                                        className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                                        onChange={(e) => {
                                            (window as any).saveAddressChecked = e.target.checked;
                                        }}
                                    />
                                    <label htmlFor="save-address" className="text-sm text-gray-600">{t('checkout.saveAddress')}</label>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Step 2: Delivery Options */}
                    <section className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-medium tracking-wide flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full border border-black text-black text-sm font-bold">2</span>
                                {t('checkout.deliveryMethod')}
                            </h2>
                            {cartWeight > 0 && (
                                <span className="text-xs text-gray-500 font-medium">
                                    Total Weight: {cartWeight}kg
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {shippingRates.length > 0 ? (
                                shippingRates.map((rate, index) => (
                                    <label key={`${rate.id}-${index}`} className="relative p-6 border rounded-xl cursor-pointer hover:border-black transition-all group">
                                        <input
                                            type="radio"
                                            name="shipping"
                                            className="peer sr-only"
                                            checked={selectedShippingRate?.id === rate.id}
                                            onChange={() => {
                                                setSelectedShippingRate(rate);
                                                setSelectedShippingMethod(rate.id);
                                            }}
                                        />
                                        <div className="absolute inset-0 border-2 border-transparent peer-checked:border-black rounded-xl transition-all"></div>
                                        <div className="relative flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Truck className="w-6 h-6 text-gray-400 peer-checked:text-black" />
                                                <span className="font-bold text-lg">
                                                    {(!rate.price || rate.price === 0) ? t('checkout.free') : `${Number(rate.price).toFixed(2)}€`}
                                                </span>
                                            </div>
                                        </div>
                                        <h3 className="font-serif text-lg text-black mb-1">{rate.name}</h3>
                                        <p className="text-sm text-gray-500">{rate.estimatedDays}</p>
                                    </label>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">Please select a country to see shipping options.</p>
                            )}
                        </div>
                    </section>

                    {/* Step 3: Payment Method */}
                    <section className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-medium tracking-wide flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full border border-black/20 text-black text-sm font-bold">3</span>
                                {t('checkout.paymentMethod')}
                            </h2>
                        </div>

                        {/* Payment Method Selector */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {(() => {
                                let methods = [];
                                try {
                                    if (settings.payment_methods) {
                                        methods = JSON.parse(settings.payment_methods).filter((m: any) => m.isEnabled);
                                    }
                                } catch (e) { }

                                // Fallback if no methods are enabled/configured
                                if (methods.length === 0) {
                                    return (
                                        <>
                                            <label className="relative p-6 border rounded-xl cursor-pointer hover:border-black transition-all group">
                                                <input type="radio" name="payment" className="peer sr-only" checked={selectedPaymentMethod === "stripe"} onChange={() => setSelectedPaymentMethod("stripe")} />
                                                <div className="absolute inset-0 border-2 border-transparent peer-checked:border-black rounded-xl"></div>
                                                <div className="relative flex items-center gap-3 mb-2">
                                                    <CreditCard className="w-6 h-6 text-gray-400 peer-checked:text-black" />
                                                    <h3 className="font-serif text-lg text-black">Credit Card</h3>
                                                </div>
                                            </label>
                                            <label className="relative p-6 border rounded-xl cursor-pointer hover:border-black transition-all group">
                                                <input type="radio" name="payment" className="peer sr-only" checked={selectedPaymentMethod === "cod"} onChange={() => setSelectedPaymentMethod("cod")} />
                                                <div className="absolute inset-0 border-2 border-transparent peer-checked:border-black rounded-xl"></div>
                                                <div className="relative flex items-center gap-3 mb-2">
                                                    <Banknote className="w-6 h-6 text-gray-400 peer-checked:text-black" />
                                                    <h3 className="font-serif text-lg text-black">Cash on Delivery</h3>
                                                </div>
                                            </label>
                                        </>
                                    );
                                }

                                return methods.map((method: any) => (
                                    <label key={method.id} className="relative p-6 border rounded-xl cursor-pointer hover:border-black transition-all group">
                                        <input
                                            type="radio"
                                            name="payment"
                                            className="peer sr-only"
                                            checked={selectedPaymentMethod === method.provider}
                                            onChange={() => setSelectedPaymentMethod(method.provider)}
                                        />
                                        <div className="absolute inset-0 border-2 border-transparent peer-checked:border-black rounded-xl transition-all"></div>
                                        <div className="relative flex items-center gap-3 mb-2">
                                            {method.provider === 'stripe' && <CreditCard className="w-6 h-6 text-gray-400 peer-checked:text-black" />}
                                            {method.provider === 'paypal' && <Coins className="w-6 h-6 text-gray-400 peer-checked:text-black" />}
                                            {method.provider === 'manual' && <Banknote className="w-6 h-6 text-gray-400 peer-checked:text-black" />}
                                            <h3 className="font-serif text-lg text-black">{method.name}</h3>
                                        </div>
                                        <p className="text-xs text-gray-500 pl-9">{method.description}</p>
                                    </label>
                                ));
                            })()}
                        </div>

                        {/* Payment Content */}
                        <div className="p-6 border border-gray-100 rounded-xl bg-gray-50/50">
                            {selectedPaymentMethod === "stripe" && clientSecret && (
                                <Elements options={options} stripe={stripePromise}>
                                    <StripePaymentForm amount={orderTotal} onSuccess={handlePlaceOrder} isFormValid={isValid} />
                                </Elements>
                            )}
                            {selectedPaymentMethod === "cod" && (
                                <div className="text-center py-4">
                                    <p className="text-gray-600 mb-6">Pay properly upon delivery. Additional fees may apply depending on the carrier.</p>
                                    <button
                                        onClick={() => handlePlaceOrder()} // No payment ID for COD
                                        disabled={isSubmitting}
                                        className={`w-full py-5 bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-900 hover:scale-[1.02] transition-all duration-300 rounded-xl shadow-xl flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                                    >
                                        {isSubmitting ? t('checkout.processing') : t('checkout.placeOrder')} <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-5 relative">
                    <div className="sticky top-32 p-8 md:p-10 bg-gray-50 rounded-3xl">
                        <h2 className="text-2xl font-serif text-black mb-8 flex items-center gap-3">
                            <ShoppingBag className="w-5 h-5" /> {t('checkout.yourOrder')}
                        </h2>

                        <div className="space-y-6 mb-8 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                            {items.length === 0 ? (
                                <p className="text-gray-400 italic py-8 text-center">{t('checkout.emptyBag')}</p>
                            ) : (
                                items.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-start pb-6 border-b border-black/5 last:border-0">
                                        <div className="relative w-20 h-24 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-black/5">
                                            <Image src={item.image} alt={item.title} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-lg text-black truncate">{item.title}</h3>
                                            <p className="text-sm text-gray-500 mb-2">Qty: {item.quantity}</p>
                                            <p className="font-serif text-black">{formatPrice(item.price)}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="space-y-4 pt-6 border-t border-black/10">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>{t('checkout.subtotal')} (HT)</span>
                                <span>{subtotal.toFixed(2)}€</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>{t('checkout.tax')}</span>
                                <span>{taxTotal.toFixed(2)}€</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>{t('checkout.shipping')}</span>
                                <span>{selectedShippingRate && selectedShippingRate.price !== undefined ? `${Number(selectedShippingRate.price).toFixed(2)}€` : '--'}</span>
                            </div>

                            {/* Coupon Section */}
                            <div className="py-4 border-y border-black/5 my-4 space-y-3">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Promo Code"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm uppercase outline-none focus:border-black transition-colors"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={isApplyingCoupon || !couponCode}
                                        className="bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
                                    >
                                        {isApplyingCoupon ? '...' : 'Apply'}
                                    </button>
                                </div>
                                {couponError && <p className="text-red-500 text-xs">{couponError}</p>}
                                {appliedCoupon && (
                                    <div className="flex justify-between text-sm text-green-600 font-medium items-center bg-green-50 p-2 rounded">
                                        <span>Discount ({appliedCoupon.code})</span>
                                        <div className="flex items-center gap-2">
                                            <span>-{discountAmount.toFixed(2)}€</span>
                                            <button onClick={() => { setAppliedCoupon(null); setDiscountAmount(0); setCouponCode(''); }} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between text-2xl font-serif text-black pt-2">
                                <span>{t('checkout.total')} (TTC)</span>
                                <span>{Math.max(0, orderTotal - discountAmount).toFixed(2)}€</span>
                            </div>
                        </div>

                        <p className="text-center text-xs text-gray-400 mt-8 flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animation-pulse"></span> {t('checkout.secureCheckout')}
                        </p>
                    </div>
                </div>

            </div>
        </main>
    );
}
