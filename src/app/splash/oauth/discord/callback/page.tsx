"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useSessionStore } from "@/lib/stores/session";
import { apiClient } from "@/lib/api/client";
import FlowParticles from "@/components/auth/flow-particles";

export default function DiscordCallbackPage() {
  const router = useRouter();
  const session = useSessionStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      setStatus("error");
      setError("No authorization code provided.");
      return;
    }

    const exchange = async () => {
      try {
        const response = await apiClient.get("/api/auth/discord/callback", {
          params: { code },
        });
        const data = response.data;

        const user = data.user
          ? {
              accountId: data.user.id || "",
              displayName: data.user.username || "",
              email: data.user.email || "",
              banned: false,
              profilePicture: data.user.avatar || "",
              discordId: "",
              roles: [],
            }
          : null;

        session.setToken(data.token, user);
        setStatus("success");
        setTimeout(() => router.push("/home"), 1500);
      } catch {
        setStatus("error");
        setError("Failed to authenticate with Discord.");
      }
    };

    exchange();
  }, [router, session]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070a] overflow-y-auto">
      <FlowParticles className="fixed inset-0" quantity={30} />
      <motion.div
        className="relative z-10 w-96 p-8 my-10 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg flex flex-col items-center justify-center text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <img
          src="/Classified.png"
          alt="Classified"
          className="h-16 w-auto object-contain mb-6"
        />

        {status === "loading" && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-yellow-300" />
            <p className="text-white font-medium">Authenticating...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-full">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
            <p className="text-white font-medium">Connected!</p>
            <p className="text-sm text-gray-400">Redirecting...</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-3">
            <div className="bg-red-500/20 p-2 rounded-full">
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
            <p className="text-white font-medium">Authentication failed</p>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        )}

        <button
          onClick={() => router.push("/")}
          className="mt-6 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm transition-colors"
        >
          Back to Login
        </button>
      </motion.div>
    </div>
  );
}
