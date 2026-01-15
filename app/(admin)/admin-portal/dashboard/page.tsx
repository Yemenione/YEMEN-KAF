export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard title="Total Revenue" value="$45,231.89" change="+12.5%" />
                <KPICard title="Active Orders" value="12" change="Processing" neutral />
                <KPICard title="Low Stock Items" value="3" change="Alert" negative />
                <KPICard title="New VIP Clients" value="+5" change="This Week" />
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
                {/* Sales Globe Placeholder */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col items-center justify-center">
                    <div className="w-64 h-64 rounded-full border-2 border-dashed border-gray-300 dark:border-zinc-700 flex items-center justify-center">
                        <span className="text-gray-400 font-medium">Real-time Sales Globe</span>
                    </div>
                    <p className="mt-4 text-sm text-gray-500">Visualizing live traffic...</p>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                    <h3 className="font-medium mb-4">Live Activity</h3>
                    <ul className="space-y-4">
                        <ActivityItem text="Order #1023 placed from Paris, FR" time="2m ago" />
                        <ActivityItem text="Stock alert: Royal Sidr Honey (500g)" time="15m ago" warning />
                        <ActivityItem text="New VIP registration: Al-Maktoum" time="1h ago" />
                        <ActivityItem text="Shipment delivered: #9982" time="3h ago" />
                    </ul>
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, change, negative, neutral }: { title: string, value: string, change: string, negative?: boolean, neutral?: boolean }) {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold dark:text-white">{value}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${negative ? 'bg-red-100 text-red-700' : neutral ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {change}
                </span>
            </div>
        </div>
    )
}

function ActivityItem({ text, time, warning }: { text: string, time: string, warning?: boolean }) {
    return (
        <li className="flex items-start gap-3 text-sm">
            <div className={`mt-1.5 w-2 h-2 rounded-full ${warning ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <div>
                <p className="text-gray-700 dark:text-gray-300">{text}</p>
                <p className="text-xs text-gray-400">{time}</p>
            </div>
        </li>
    )
}
