import { getAdminProfile } from "@/app/actions/profile";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProfileForm from './ProfileForm';

export const dynamic = 'force-dynamic';

export default async function AdminProfilePage() {
    const admin = await getAdminProfile();

    if (!admin) {
        redirect('/admin-portal/login');
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-1">Account & Settings</h1>
                <p className="text-gray-500 text-sm">Manage your profile information and system preferences.</p>
            </div>

            <ProfileForm admin={admin} />
        </div>
    );
}
