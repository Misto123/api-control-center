'use client';

import Link from 'next/link';
import { ArrowLeft, Plus, Activity, AlertCircle, Database } from 'lucide-react';

export default function ServicesPage() {
  // Mock data - will be replaced with real API calls
  const services = [
    {
      id: 1,
      name: 'Serper.dev',
      status: 'ACTIVE',
      credits: 81,
      totalCredits: 100,
      estimatedDaysRemaining: 23,
      category: 'Search API',
      uptime30d: 99.8,
    },
    {
      id: 2,
      name: 'DeepSeek',
      status: 'ACTIVE',
      credits: 18,
      totalCredits: 100,
      estimatedDaysRemaining: 6,
      category: 'AI/LLM',
      uptime30d: 99.91,
    },
    {
      id: 3,
      name: 'Runware AI',
      status: 'DOWN',
      credits: 45,
      totalCredits: 100,
      estimatedDaysRemaining: 12,
      category: 'Image Generation',
      uptime30d: 98.2,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'DOWN':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCreditColor = (credits: number) => {
    if (credits < 20) return 'text-red-600';
    if (credits < 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link 
              href="/" 
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-4xl font-bold mb-2">Services</h1>
            <p className="text-gray-600">Manage and monitor your API services</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md">
            <Plus className="w-5 h-5" />
            Add Service
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-gray-600 text-sm mb-1">Total Services</div>
            <div className="text-3xl font-bold">{services.length}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-gray-600 text-sm mb-1">Active</div>
            <div className="text-3xl font-bold text-green-600">
              {services.filter(s => s.status === 'ACTIVE').length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-gray-600 text-sm mb-1">Down</div>
            <div className="text-3xl font-bold text-red-600">
              {services.filter(s => s.status === 'DOWN').length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-gray-600 text-sm mb-1">Avg Uptime</div>
            <div className="text-3xl font-bold text-blue-600">
              {(services.reduce((acc, s) => acc + s.uptime30d, 0) / services.length).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Services List */}
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-semibold">{service.name}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                          service.status
                        )}`}
                      >
                        ● {service.status}
                      </span>
                    </div>
                    <p className="text-gray-600">{service.category}</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    View Details →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Credits */}
                  <div>
                    <div className="text-gray-600 text-sm mb-2">Credits Remaining</div>
                    <div className="mb-2">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-2xl font-bold ${getCreditColor(service.credits)}`}>
                          {service.credits}%
                        </span>
                        <span className="text-gray-500 text-sm">
                          of {service.totalCredits}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${
                          service.credits < 20
                            ? 'bg-red-500'
                            : service.credits < 50
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${service.credits}%` }}
                      />
                    </div>
                  </div>

                  {/* Estimated Days */}
                  <div>
                    <div className="text-gray-600 text-sm mb-2">Estimated Depletion</div>
                    <div className="flex items-center gap-2">
                      <AlertCircle
                        className={`w-5 h-5 ${
                          service.estimatedDaysRemaining < 7
                            ? 'text-red-500'
                            : service.estimatedDaysRemaining < 14
                            ? 'text-yellow-500'
                            : 'text-green-500'
                        }`}
                      />
                      <span className="text-xl font-semibold">
                        ~{service.estimatedDaysRemaining} days
                      </span>
                    </div>
                  </div>

                  {/* Uptime */}
                  <div>
                    <div className="text-gray-600 text-sm mb-2">Uptime (30 days)</div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-500" />
                      <span className="text-xl font-semibold">{service.uptime30d}%</span>
                    </div>
                    <div className="mt-2 flex gap-1">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-8 flex-1 rounded ${
                            service.status === 'DOWN' && i === 29
                              ? 'bg-red-500'
                              : 'bg-green-500'
                          }`}
                          title={`Day ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (when no services) */}
        {services.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Database className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No services yet</h3>
            <p className="text-gray-600 mb-6">
              Get started by adding your first API service to monitor
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Add Your First Service
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
