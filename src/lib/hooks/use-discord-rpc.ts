"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { invoke } from "@tauri-apps/api/core";
import { useSessionStore } from "@/lib/stores/session";
import { useAuthStore } from "@/lib/stores/auth";

export function useDiscordRpc() {
  const pathname = usePathname();
  const session = useSessionStore();
  const legacyAuth = useAuthStore();

  useEffect(() => {
    const page = pathname === "/" ? "login" : pathname.replace("/", "");
    const user = session.user || legacyAuth.user;
    const username = user?.displayName || user?.username || "Guest";

    invoke("rich_presence", { username, page }).catch(() => {
    });
  }, [pathname, session.user, legacyAuth.user]);
}
