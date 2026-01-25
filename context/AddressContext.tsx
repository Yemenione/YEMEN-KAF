"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export interface Address {
    id: number | string;
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}

interface AddressContextType {
    addresses: Address[];
    loading: boolean;
    addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
    updateAddress: (id: number | string, address: Partial<Address>) => Promise<void>;
    deleteAddress: (id: number | string) => Promise<void>;
    setDefaultAddress: (id: number | string) => Promise<void>;
    refreshAddresses: () => Promise<void>;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export function AddressProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshAddresses = async () => {
        if (!isAuthenticated) {
            const stored = localStorage.getItem('guest_addresses');
            if (stored) {
                try {
                    setAddresses(JSON.parse(stored));
                } catch (e) {
                    setAddresses([]);
                }
            } else {
                setAddresses([]);
            }
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await fetch('/api/account/addresses');
            if (res.ok) {
                const data = await res.json();
                if (data.addresses) {
                    const mappedAddresses = data.addresses.map((a: any) => ({
                        id: a.id,
                        street: a.street_address || a.street || '',
                        city: a.city || '',
                        state: a.state || '',
                        postalCode: a.postal_code || a.postalCode || '',
                        country: a.country || 'France',
                        isDefault: a.is_default === 1
                    }));
                    setAddresses(mappedAddresses);
                }
            }
        } catch (error) {
            console.error("Failed to fetch addresses", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            await refreshAddresses();

            // Merge guest addresses if just authenticated
            if (isAuthenticated) {
                const storedGuest = localStorage.getItem('guest_addresses');
                if (storedGuest) {
                    try {
                        const guestAddresses: Address[] = JSON.parse(storedGuest);
                        for (const addr of guestAddresses) {
                            await fetch('/api/account/addresses', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    street: addr.street,
                                    city: addr.city,
                                    state: addr.state,
                                    postalCode: addr.postalCode,
                                    country: addr.country,
                                    isDefault: addr.isDefault
                                })
                            });
                        }
                        localStorage.removeItem('guest_addresses');
                        await refreshAddresses();
                    } catch (e) {
                        console.error("Failed to merge guest addresses", e);
                    }
                }
            }
        };

        init();
    }, [isAuthenticated]);

    const addAddress = async (address: Omit<Address, 'id'>) => {
        if (!isAuthenticated) {
            const newAddr = { ...address, id: `guest_${Date.now()}` };
            const newAddresses = address.isDefault
                ? [...addresses.map(a => ({ ...a, isDefault: false })), newAddr]
                : [...addresses, newAddr];
            setAddresses(newAddresses);
            localStorage.setItem('guest_addresses', JSON.stringify(newAddresses));
            return;
        }

        try {
            const res = await fetch('/api/account/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(address)
            });
            if (res.ok) {
                await refreshAddresses();
            }
        } catch (error) {
            console.error("Failed to add address", error);
        }
    };

    const updateAddress = async (id: number | string, address: Partial<Address>) => {
        if (!isAuthenticated) {
            const newAddresses = addresses.map(a => {
                if (a.id === id) {
                    const updated = { ...a, ...address };
                    return updated;
                }
                if (address.isDefault) return { ...a, isDefault: false };
                return a;
            });
            setAddresses(newAddresses);
            localStorage.setItem('guest_addresses', JSON.stringify(newAddresses));
            return;
        }

        try {
            const res = await fetch(`/api/account/addresses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(address)
            });
            if (res.ok) {
                await refreshAddresses();
            }
        } catch (error) {
            console.error("Failed to update address", error);
        }
    };

    const deleteAddress = async (id: number | string) => {
        if (!isAuthenticated) {
            const newAddresses = addresses.filter(a => a.id !== id);
            setAddresses(newAddresses);
            localStorage.setItem('guest_addresses', JSON.stringify(newAddresses));
            return;
        }

        try {
            const res = await fetch(`/api/account/addresses/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                await refreshAddresses();
            }
        } catch (error) {
            console.error("Failed to delete address", error);
        }
    };

    const setDefaultAddress = async (id: number | string) => {
        await updateAddress(id, { isDefault: true });
    };

    return (
        <AddressContext.Provider value={{
            addresses,
            loading,
            addAddress,
            updateAddress,
            deleteAddress,
            setDefaultAddress,
            refreshAddresses
        }}>
            {children}
        </AddressContext.Provider>
    );
}

export const useAddress = () => {
    const context = useContext(AddressContext);
    if (context === undefined) {
        throw new Error('useAddress must be used within an AddressProvider');
    }
    return context;
};
