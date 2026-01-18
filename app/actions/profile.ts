'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-auth";

export async function updateAdminAvatar(avatarUrl: string) {
    try {
        const session = await getAdminSession();
        if (!session) return { success: false, error: "Unauthorized" };

        await prisma.admin.update({
            where: { id: session.id },
            data: { avatar: avatarUrl }
        });
        revalidatePath('/admin-portal/profile');
        revalidatePath('/admin-portal/settings');
        return { success: true };
    } catch (error) {
        console.error("Error updating admin avatar:", error);
        return { success: false, error: "Failed to update avatar" };
    }
}

export async function getAdminProfile() {
    try {
        const session = await getAdminSession();
        if (!session) return null;

        const admin = await prisma.admin.findUnique({
            where: { id: session.id }
        });
        return admin;
    } catch {
        return null;
    }
}
