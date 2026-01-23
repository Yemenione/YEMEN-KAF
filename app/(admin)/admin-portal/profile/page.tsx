import { getAdminProfile } from "@/app/actions/profile";
import ProfileForm from "./ProfileForm";
import { redirect } from "next/navigation";

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
