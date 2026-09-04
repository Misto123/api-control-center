import { AlertTriangle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-12 border-8 border-red-600">
          {/* Warning Icon */}
          <div className="flex justify-center mb-8">
            <div className="bg-red-100 p-8 rounded-full">
              <AlertTriangle className="w-32 h-32 text-red-600" />
            </div>
          </div>

          {/* Main Message */}
          <div className="text-center space-y-6">
            <h1 className="text-6xl font-black text-red-600 mb-4">
              PROJECT DEPRECATED
            </h1>
            
            <div className="bg-red-50 border-4 border-red-600 rounded-xl p-8 space-y-4">
              <p className="text-3xl font-bold text-red-800">
                ⚠️ THIS PROJECT IS NO LONGER ACTIVE ⚠️
              </p>
              
              <p className="text-xl text-gray-800 leading-relaxed">
                This API Control Center has been permanently shut down.
              </p>
              
              <div className="text-left space-y-3 text-lg text-gray-700 mt-6">
                <p className="font-semibold">❌ All monitoring has been stopped</p>
                <p className="font-semibold">❌ All API endpoints are disabled</p>
                <p className="font-semibold">❌ All automated processes are halted</p>
                <p className="font-semibold">❌ No data is being collected or processed</p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t-4 border-red-200">
              <p className="text-2xl font-bold text-gray-800">
                This application is offline and will not respond to requests.
              </p>
              <p className="text-lg text-gray-600 mt-4">
                If you need access to your data, please contact the administrator.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white text-lg font-semibold">
            API Control Center • Deprecated {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
