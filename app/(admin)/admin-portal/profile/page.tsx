import { getAdminProfile } from "@/app/actions/profile";
import { getFirebaseConfig } from "@/app/actions/settings";
import ProfileForm from "./ProfileForm";
import { redirect } from "next/navigation";

export default async function AdminProfilePage() {
    const admin = await getAdminProfile();
    const firebaseConfig = await getFirebaseConfig();

    if (!admin) {
        redirect('/admin-portal/login');
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">My Profile</h1>
                <p className="text-gray-500">Manage your personal information and account settings.</p>
            </div>

            <ProfileForm admin={admin} firebaseConfig={firebaseConfig} />
        </div>
    );
}
