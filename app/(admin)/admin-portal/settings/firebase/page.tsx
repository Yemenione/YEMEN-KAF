import { getFirebaseConfig, updateFirebaseConfig } from "@/app/actions/settings";
import { Save } from "lucide-react";
import { redirect } from "next/navigation";

export default async function FirebaseSettingsPage() {
    // secure this page if needed, though middleware usually handles admin routes
    const config = await getFirebaseConfig();

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">Firebase Configuration</h1>
                <p className="text-gray-500">Configure your Firebase project keys here. These will be used for authentication and storage.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <form action={async (formData) => {
                    'use server';
                    const data = {
                        apiKey: formData.get('apiKey') as string,
                        authDomain: formData.get('authDomain') as string,
                        projectId: formData.get('projectId') as string,
                        storageBucket: formData.get('storageBucket') as string,
                        messagingSenderId: formData.get('messagingSenderId') as string,
                        appId: formData.get('appId') as string,
                    };
                    await updateFirebaseConfig(data);
                    redirect('/admin-portal/settings/firebase');
                }}>
                    <div className="grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                                <input
                                    name="apiKey"
                                    defaultValue={config?.apiKey}
                                    type="text"
                                    className="w-full p-3 rounded-lg border border-gray-200 focus:border-black focus:ring-0 outline-none transition-colors font-mono text-sm"
                                    placeholder="AIzaSy..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Auth Domain</label>
                                <input
                                    name="authDomain"
                                    defaultValue={config?.authDomain}
                                    type="text"
                                    className="w-full p-3 rounded-lg border border-gray-200 focus:border-black focus:ring-0 outline-none transition-colors font-mono text-sm"
                                    placeholder="project-id.firebaseapp.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Project ID</label>
                                <input
                                    name="projectId"
                                    defaultValue={config?.projectId}
                                    type="text"
                                    className="w-full p-3 rounded-lg border border-gray-200 focus:border-black focus:ring-0 outline-none transition-colors font-mono text-sm"
                                    placeholder="project-id"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Storage Bucket</label>
                                <input
                                    name="storageBucket"
                                    defaultValue={config?.storageBucket}
                                    type="text"
                                    className="w-full p-3 rounded-lg border border-gray-200 focus:border-black focus:ring-0 outline-none transition-colors font-mono text-sm"
                                    placeholder="project-id.appspot.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Messaging Sender ID</label>
                                <input
                                    name="messagingSenderId"
                                    defaultValue={config?.messagingSenderId}
                                    type="text"
                                    className="w-full p-3 rounded-lg border border-gray-200 focus:border-black focus:ring-0 outline-none transition-colors font-mono text-sm"
                                    placeholder="123456789"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">App ID</label>
                                <input
                                    name="appId"
                                    defaultValue={config?.appId}
                                    type="text"
                                    className="w-full p-3 rounded-lg border border-gray-200 focus:border-black focus:ring-0 outline-none transition-colors font-mono text-sm"
                                    placeholder="1:123456789:web:..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                className="bg-black text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors"
                            >
                                <Save size={18} />
                                Save Configuration
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
