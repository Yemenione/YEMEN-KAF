'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getZones() {
    try {
        const zones = await prisma.shippingZone.findMany({
            include: {
                rates: {
                    include: {
                        carrier: true
                    },
                    orderBy: {
                        minWeight: 'asc'
                    }
                }
            }
        });

        // Convert Decimal to number for serialization
        const serializedZones = zones.map(zone => ({
            ...zone,
            rates: zone.rates.map(rate => ({
                ...rate,
                price: Number(rate.price)
            }))
        }));

        return { success: true, data: serializedZones };
    } catch (error) {
        console.error("Error fetching zones:", error);
        return { success: false, error: "Failed to fetch zones" };
    }
}

export async function createZone(data: { name: string, countries: string[] }) {
    try {
        const zone = await prisma.shippingZone.create({
            data: {
                name: data.name,
                countries: JSON.stringify(data.countries),
                isActive: true
            }
        });
        revalidatePath("/admin-portal/settings/shipping");
        return { success: true, data: zone };
    } catch {
        return { success: false, error: "Failed to create zone" };
    }
}

export async function updateZone(id: number, data: { name?: string, countries?: string[] }) {
    try {
        const zone = await prisma.shippingZone.update({
            where: { id },
            data: {
                name: data.name,
                countries: data.countries ? JSON.stringify(data.countries) : undefined
            }
        });
        revalidatePath("/admin-portal/settings/shipping");
        return { success: true, data: zone };
    } catch {
        return { success: false, error: "Failed to update zone" };
    }
}

export async function deleteZone(id: number) {
    try {
        await prisma.shippingZone.delete({ where: { id } });
        revalidatePath("/admin-portal/settings/shipping");
        return { success: true };
    } catch {
        return { success: false, error: "Failed to delete zone" };
    }
}

export async function createRate(data: { zoneId: number, carrierId: number, minWeight: number, maxWeight: number, price: number }) {
    try {
        const rate = await prisma.shippingRate.create({
            data: {
                zoneId: data.zoneId,
                carrierId: data.carrierId,
                minWeight: data.minWeight,
                maxWeight: data.maxWeight,
                price: data.price
            }
        });
        revalidatePath("/admin-portal/settings/shipping");
        // Return serialized rate
        return {
            success: true,
            data: {
                ...rate,
                price: Number(rate.price)
            }
        };
    } catch {
        return { success: false, error: "Failed to create rate" };
    }
}

export async function deleteRate(id: number) {
    try {
        await prisma.shippingRate.delete({ where: { id } });
        revalidatePath("/admin-portal/settings/shipping");
        return { success: true };
    } catch {
        return { success: false, error: "Failed to delete rate" };
    }
}
