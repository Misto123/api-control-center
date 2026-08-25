import Link from 'next/link';
import { Activity, Bell, FolderKanban, LayoutDashboard, Settings, Database } from 'lucide-react';
import { HomeServiceStatus } from '@/components/HomeServiceStatus';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            API Control Center
          </h1>
          <p className="text-gray-600 text-lg">
            Monitor, manage, and optimize your API services with real-time alerts and insights
          </p>
        </div>

        <HomeServiceStatus />

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Link href="/dashboard" className="group">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-500">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-500 transition-colors">
                  <LayoutDashboard className="w-6 h-6 text-blue-600 group-hover:text-white" />
                </div>
                <h2 className="text-2xl font-semibold ml-4 group-hover:text-blue-600 transition-colors">Dashboard</h2>
              </div>
              <p className="text-gray-600">View all services status, uptime metrics, and quick statistics</p>
              <div className="mt-4 text-blue-600 font-medium flex items-center">
                Get Started →
              </div>
            </div>
          </Link>

          <Link href="/services" className="group">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-500">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-500 transition-colors">
                  <Activity className="w-6 h-6 text-green-600 group-hover:text-white" />
                </div>
                <h2 className="text-2xl font-semibold ml-4 group-hover:text-green-600 transition-colors">Services</h2>
              </div>
              <p className="text-gray-600">Manage your API services, monitor health, and track credits</p>
              <div className="mt-4 text-green-600 font-medium flex items-center">
                View Services →
              </div>
            </div>
          </Link>

          <Link href="/alerts" className="group">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-red-500">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-red-100 rounded-lg group-hover:bg-red-500 transition-colors">
                  <Bell className="w-6 h-6 text-red-600 group-hover:text-white" />
                </div>
                <h2 className="text-2xl font-semibold ml-4 group-hover:text-red-600 transition-colors">Alerts</h2>
              </div>
              <p className="text-gray-600">Monitor alerts, notifications, and service incidents</p>
              <div className="mt-4 text-red-600 font-medium flex items-center">
                View Alerts →
              </div>
            </div>
          </Link>

          <Link href="/projects" className="group">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-500">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-500 transition-colors">
                  <FolderKanban className="w-6 h-6 text-purple-600 group-hover:text-white" />
                </div>
                <h2 className="text-2xl font-semibold ml-4 group-hover:text-purple-600 transition-colors">Projects</h2>
              </div>
              <p className="text-gray-600">Organize services by project and track dependencies</p>
              <div className="mt-4 text-purple-600 font-medium flex items-center">
                View Projects →
              </div>
            </div>
          </Link>

          <Link href="/categories" className="group">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-orange-500">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-500 transition-colors">
                  <Database className="w-6 h-6 text-orange-600 group-hover:text-white" />
                </div>
                <h2 className="text-2xl font-semibold ml-4 group-hover:text-orange-600 transition-colors">Categories</h2>
              </div>
              <p className="text-gray-600">Group and organize your services into categories</p>
              <div className="mt-4 text-orange-600 font-medium flex items-center">
                Manage Categories →
              </div>
            </div>
          </Link>

          <Link href="/settings" className="group">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-gray-500">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-500 transition-colors">
                  <Settings className="w-6 h-6 text-gray-600 group-hover:text-white" />
                </div>
                <h2 className="text-2xl font-semibold ml-4 group-hover:text-gray-600 transition-colors">Settings</h2>
              </div>
              <p className="text-gray-600">Configure notifications, thresholds, and integrations</p>
              <div className="mt-4 text-gray-600 font-medium flex items-center">
                Open Settings →
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Info Section */}
        <div className="bg-white rounded-xl shadow-md p-8 border-l-4 border-blue-500">
          <h3 className="text-2xl font-semibold mb-4">Getting Started</h3>
          <div className="space-y-3 text-gray-700">
            <p>
              <span className="font-semibold">1.</span> Add your first service in the <Link href="/services" className="text-blue-600 hover:underline">Services</Link> section
            </p>
            <p>
              <span className="font-semibold">2.</span> Configure alert thresholds and monitoring intervals
            </p>
            <p>
              <span className="font-semibold">3.</span> Set up <Link href="/settings" className="text-blue-600 hover:underline">Slack/Telegram notifications</Link> to receive alerts
            </p>
            <p>
              <span className="font-semibold">4.</span> Organize services into <Link href="/projects" className="text-blue-600 hover:underline">projects</Link> for better management
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>API Control Center • Monitor your APIs with confidence</p>
          <p className="mt-2">
            <a 
              href="https://github.com/contactrebel/api-control-center" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
