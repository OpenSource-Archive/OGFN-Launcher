"use client";

import { usePathname } from "next/navigation";
import { Home, FolderOpen, ShoppingBag, Trophy, Settings, WrenchIcon } from "lucide-react";
import { useServerStatus } from "@/lib/stores/server-status";

const navItems = [
  { label: "Home", path: "/home", icon: Home },
  { label: "Library", path: "/library", icon: FolderOpen },
  { label: "Shop", path: "/shop", icon: ShoppingBag },
  { label: "Leaderboard", path: "/leaderboard", icon: Trophy },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { maintenance } = useServerStatus();

  const navigate = (path: string) => {
    if (maintenance) return;
    window.location.href = path;
  };

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-16 bg-black h-screen shadow-xl border-r border-white/5 flex flex-col items-center py-4 shrink-0">
      <div className="mb-6">
        <img src="/splashlogo.png" alt="Classified" className="w-9 h-9 filter drop-shadow-[0_0_12px_#ca8a04]" />
      </div>

      <nav className="flex flex-col gap-2 w-full px-2">
        {maintenance ? (
          <div title="Maintenance" className="w-full aspect-square rounded-xl flex items-center justify-center text-yellow-500/60">
            <WrenchIcon className="w-5 h-5" />
          </div>
        ) : navItems.map((item) => (
          <button
            key={item.path}
            title={item.label}
            onClick={() => navigate(item.path)}
            className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-200 ${
              isActive(item.path)
                ? "bg-yellow-500/10 text-yellow-300 ring-1 ring-yellow-500/30"
                : "text-gray-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <item.icon className="w-5 h-5" />
          </button>
        ))}
      </nav>

      <div className="mt-auto w-full px-2 pb-2">
        <button
          title="Settings"
          onClick={() => navigate("/settings")}
          disabled={maintenance}
          className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-200 ${
            maintenance
              ? "text-gray-700 cursor-not-allowed"
              : isActive("/settings")
              ? "bg-yellow-500/10 text-yellow-300 ring-1 ring-yellow-500/30"
              : "text-gray-500 hover:text-white hover:bg-white/5"
          }`}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}
