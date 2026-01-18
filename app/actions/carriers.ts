"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCarriers() {
    try {
        return await prisma.carrier.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'asc' }
        });
    } catch (error) {
        console.error("Error fetching carriers:", error);
        return [];
    }
}

export async function getAllCarriers() {
    try {
        return await prisma.carrier.findMany({
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error("Error fetching all carriers:", error);
        return [];
    }
}

export async function updateCarrier(id: number, data: any) {
    try {
        const carrier = await prisma.carrier.update({
            where: { id },
            data
        });
        revalidatePath("/admin-portal/settings/shipping");
        revalidatePath("/shop/[slug]", "page");
        return { success: true, carrier };
    } catch (error) {
        console.error("Error updating carrier:", error);
        return { success: false, error: "Failed to update carrier" };
    }
}

export async function createCarrier(data: any) {
    try {
        const carrier = await prisma.carrier.create({
            data
        });
        revalidatePath("/admin-portal/settings/shipping");
        revalidatePath("/shop/[slug]", "page");
        return { success: true, carrier };
    } catch (error) {
        console.error("Error creating carrier:", error);
        return { success: false, error: "Failed to create carrier" };
    }
}

export async function deleteCarrier(id: number) {
    try {
        await prisma.carrier.delete({
            where: { id }
        });
        revalidatePath("/admin-portal/settings/shipping");
        revalidatePath("/shop/[slug]", "page");
        return { success: true };
    } catch (error) {
        console.error("Error deleting carrier:", error);
        return { success: false, error: "Failed to delete carrier" };
    }
}
