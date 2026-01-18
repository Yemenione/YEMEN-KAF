import { getStripeConfig, updateStripeConfig } from "@/app/actions/settings";
import { Save, CreditCard } from "lucide-react";
import { redirect } from "next/navigation";

export default async function StripeSettingsPage() {
    const config = await getStripeConfig();

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <CreditCard className="text-blue-600" />
                    Stripe Configuration
                </h1>
                <p className="text-gray-500">Configure your Stripe API keys for payment processing and webhooks.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <form action={async (formData) => {
                    'use server';
                    const data = {
                        publishableKey: formData.get('publishableKey') as string,
                        secretKey: formData.get('secretKey') as string,
                        webhookSecret: formData.get('webhookSecret') as string,
                    };
                    await updateStripeConfig(data);
                    redirect('/admin-portal/settings/stripe');
                }}>
                    <div className="grid gap-6">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Publishable Key</label>
                                <input
                                    name="publishableKey"
                                    defaultValue={config?.publishableKey}
                                    type="text"
                                    className="w-full p-3 rounded-lg border border-gray-200 focus:border-black focus:ring-0 outline-none transition-colors font-mono text-sm"
                                    placeholder="pk_test_..."
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-400">This key is public and used in the frontend.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
                                <input
                                    name="secretKey"
                                    defaultValue={config?.secretKey}
                                    type="password"
                                    className="w-full p-3 rounded-lg border border-gray-200 focus:border-black focus:ring-0 outline-none transition-colors font-mono text-sm"
                                    placeholder="sk_test_..."
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-400">This key is private and should never be shared.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Webhook Secret</label>
                                <input
                                    name="webhookSecret"
                                    defaultValue={config?.webhookSecret}
                                    type="password"
                                    className="w-full p-3 rounded-lg border border-gray-200 focus:border-black focus:ring-0 outline-none transition-colors font-mono text-sm"
                                    placeholder="whsec_..."
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-400">Used to verify that events come from Stripe.</p>
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

            <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <h3 className="text-blue-800 font-bold text-sm mb-1 uppercase tracking-wider">Note de déploiement</h3>
                <p className="text-blue-600 text-sm">
                    Une fois enregistrées, ces clés seront lues directement depuis la base de données, permettant des mises à jour sans redémarrage du serveur.
                </p>
            </div>
        </div>
    );
}
