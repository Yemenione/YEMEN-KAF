'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateFirebaseConfig(data: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
}) {
    try {
        const keys = [
            'apiKey',
            'authDomain',
            'projectId',
            'storageBucket',
            'messagingSenderId',
            'appId'
        ];

        for (const key of keys) {
            const value = data[key as keyof typeof data];
            await prisma.storeConfig.upsert({
                where: { key: `firebase_${key}` },
                update: {
                    value: value || '',
                    group: 'firebase',
                    type: 'text',
                    isPublic: true // These need to be public for the client SDK
                },
                create: {
                    key: `firebase_${key}`,
                    value: value || '',
                    group: 'firebase',
                    type: 'text',
                    isPublic: true
                }
            });
        }

        revalidatePath('/admin-portal/settings/firebase');
        return { success: true };
    } catch (error) {
        console.error("Error updating Firebase config:", error);
        return { success: false, error: "Failed to save configuration" };
    }
}

export async function getFirebaseConfig() {
    try {
        const configs = await prisma.storeConfig.findMany({
            where: { group: 'firebase' }
        });

        const config: Record<string, string> = {
            apiKey: '',
            authDomain: '',
            projectId: '',
            storageBucket: '',
            messagingSenderId: '',
            appId: ''
        };

        configs.forEach(conf => {
            const shortKey = conf.key.replace('firebase_', '');
            if (shortKey in config) {
                config[shortKey] = conf.value;
            }
        });

        return config;
    } catch (error) {
        console.error("Error fetching Firebase config:", error);
        return null;
    }
}

export async function updateStripeConfig(data: {
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
}) {
    try {
        const keys = [
            { dbKey: 'stripe_publishable_key', val: data.publishableKey, public: true },
            { dbKey: 'stripe_secret_key', val: data.secretKey, public: false },
            { dbKey: 'stripe_webhook_secret', val: data.webhookSecret, public: false }
        ];

        for (const item of keys) {
            await prisma.storeConfig.upsert({
                where: { key: item.dbKey },
                update: {
                    value: item.val || '',
                    group: 'stripe',
                    type: 'password',
                    isPublic: item.public
                },
                create: {
                    key: item.dbKey,
                    value: item.val || '',
                    group: 'stripe',
                    type: 'password',
                    isPublic: item.public
                }
            });
        }

        revalidatePath('/admin-portal/settings/stripe');
        return { success: true };
    } catch (error) {
        console.error("Error updating Stripe config:", error);
        return { success: false, error: "Failed to save configuration" };
    }
}

export async function getStripeConfig() {
    try {
        const configs = await prisma.storeConfig.findMany({
            where: { group: 'stripe' }
        });

        const config = {
            publishableKey: '',
            secretKey: '',
            webhookSecret: ''
        };

        configs.forEach(conf => {
            if (conf.key === 'stripe_publishable_key') config.publishableKey = conf.value;
            if (conf.key === 'stripe_secret_key') config.secretKey = conf.value;
            if (conf.key === 'stripe_webhook_secret') config.webhookSecret = conf.value;
        });

        return config;
    } catch (error) {
        console.error("Error fetching Stripe config:", error);
        return null;
    }
}
