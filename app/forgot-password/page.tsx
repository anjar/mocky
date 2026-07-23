import { connection } from 'next/server'
import ForgotPasswordForm from "./ForgotPasswordForm";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function ForgotPassword() {
  await connection()

  return (
    <div className="auth-shell">
      <div className="auth-theme-toggle"><ThemeToggle /></div>
      <div className="auth-aside">
        <div>
          <div className="text-3xl font-bold mb-2">Mocky</div>
          <p className="text-gray-400">Engineer faster with precise API orchestration.</p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-400 mb-3">Reset your account password and get back to the dashboard without losing your projects.</p>

          <div className="bg-gray-950 rounded-lg p-4 text-sm font-mono border border-gray-700">
            <div className="text-gray-400">{'{'}</div>
            <div className="text-purple-400 ml-2">
              "type": "recovery",
            </div>
            <div className="text-purple-400 ml-2">
              "redirectTo": "/update-password",
            </div>
            <div className="text-gray-400">{'}'}</div>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500">v0.5.4 BETA</p>
        </div>
      </div>

      <div className="auth-main">
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
