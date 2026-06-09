"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Info, LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";
import { useSessionStore } from "@/lib/stores/session";
import Sidebar from "@/components/layout/Sidebar";

export default function SettingsPage() {
  const router = useRouter();
  const auth = useAuthStore();
  const session = useSessionStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [eor, setEor] = useState(false);
  const [ror, setRor] = useState(false);
  const [bubbleBuilds, setBubbleBuilds] = useState(false);

  const user = session.user || auth.user;

  const handleLogout = () => {
    auth.logout();
    router.push("/");
  };

  return (
    <div className="flex h-screen bg-[#05070a] text-white overflow-hidden">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <div className="max-w-2xl space-y-6">
          <section className="bg-[#080a0f] border border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold">Account</h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{user?.displayName || user?.username || "Unknown"}</p>
                <p className="text-sm text-gray-400">{user?.accountId}</p>
              </div>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </section>

          <section className="bg-[#080a0f] border border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold">About</h2>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Launcher Version</span>
                <span className="bg-white/5 px-3 py-1 rounded-md">1.0.0</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Credits</span>
                <span className="text-gray-300">s3cw</span>
              </div>
            </div>
          </section>

          <section className="bg-[#080a0f] border border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold">Build Settings</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: "Enable EOR", state: eor, set: setEor },
                { label: "Enable ROR", state: ror, set: setRor },
                { label: "Enable Bubble Builds", state: bubbleBuilds, set: setBubbleBuilds },
              ].map(({ label, state, set }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{label}</span>
                  <button
                    type="button"
                    onClick={() => set(!state)}
                    className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
                      state ? "bg-cyan-500" : "bg-gray-600"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        state ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#080a0f] border border-white/10 rounded-xl p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold mb-2">Logout?</h3>
              <p className="text-gray-400 text-sm mb-4">
                You will be returned to the login screen.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

