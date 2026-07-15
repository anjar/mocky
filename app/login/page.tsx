import { connection } from 'next/server'
import LoginForm from "./LoginForm";

export default async function Login() {
  await connection()
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white">
        <div>
          <div className="text-3xl font-bold mb-2">Mocky</div>
          <p className="text-gray-400">Engineer faster with precise API orchestration.</p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-400 mb-3">The productive developer environment for mocking, managing environment variables, and simulating real-world failures.</p>
          
          <div className="bg-gray-950 rounded-lg p-4 text-sm font-mono border border-gray-700">
            <div className="text-gray-400">{'{'}</div>
            <div className="text-purple-400 ml-2">
              "type": "request",
            </div>
            <div className="text-purple-400 ml-2">
              "url": "https://api.example.com",
            </div>
            <div className="text-purple-400 ml-2">
              "timeout": 5000
            </div>
            <div className="text-gray-400">{'}'}</div>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500">v0.5.4 BETA</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12">
        <LoginForm />
      </div>
    </div>
  );
}
