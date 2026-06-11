"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Play, Users, Download, X } from "lucide-react";
import { useSessionStore } from "@/lib/stores/session";
import { useAuthStore } from "@/lib/stores/auth";
import Sidebar from "@/components/layout/Sidebar";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { endpoints } from "@/lib/api/splash-endpoints";

interface NewsItem {
  id: string;
  title: string;
  body: string;
  image: string;
}

interface LauncherStatus {
  playersOnline: number;
  activeLauncherUsers: number;
  version: string;
  status: string;
}

interface PlayerStats {
  level: number;
  xp: number;
  bookLevel: number;
  vBucks: number;
}

interface Friend {
  id: string;
  username: string;
  status: "online" | "playing" | "away" | "offline";
  location?: string;
}

interface Commit {
  id: string;
  message: string;
  author: string;
  date: string;
  url: string;
  repo?: string;
}

export default function HomePage() {
  const router = useRouter();
  const session = useSessionStore();
  const legacyAuth = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const getStoredUser = () => {
    try {
      const raw = localStorage.getItem("classified.auth.user");
      if (raw) return JSON.parse(raw);
    } catch {
    }
    return null;
  };

  const user = mounted ? (session.user || legacyAuth.user || getStoredUser()) : null;
  const athena = session.athena;
  const commonCore = session.common_core || legacyAuth.commonCore;
  const [status, setStatus] = useState<LauncherStatus>({
    playersOnline: 0,
    activeLauncherUsers: 0,
    version: "1.0.0",
    status: "online",
  });
  const [news, setNews] = useState<NewsItem[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateVersion, setUpdateVersion] = useState("");
  const [updateDismissed, setUpdateDismissed] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState<PlayerStats>({
    level: 0,
    xp: 0,
    bookLevel: 0,
    vBucks: 0,
  });
  useEffect(() => {
    setStats({
      level: athena?.level ?? 0,
      xp: athena?.xp ?? 0,
      bookLevel: athena?.book_level ?? 0,
      vBucks: commonCore?.vBucks ?? 0,
    });
  }, [athena, commonCore]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await apiClient.get(API_ENDPOINTS.launcher.status);
        setStatus(res.data);
      } catch {
      }
    };

    const fetchNews = async () => {
      try {
        const res = await apiClient.get(API_ENDPOINTS.launcher.news);
        setNews(res.data.news || []);
      } catch {
        setNews([]);
      }
    };

    const fetchFriends = async () => {
      try {
        const accountId = user?.accountId;
        if (!accountId) return;
        const res = await apiClient.get(`/friends/api/public/friends/${accountId}`);
        const data = res.data || [];
        const mapped: Friend[] = data.map((f: any) => ({
          id: f.accountId || f.id,
          username: f.displayName || f.username || "Unknown",
          status: f.status || "offline",
          location: f.location,
        }));
        setFriends(mapped);
      } catch {
        setFriends([]);
      }
    };

    fetchStatus();
    fetchNews();
    fetchFriends();

    const checkForUpdate = async () => {
      try {
        const { check } = await import("@tauri-apps/plugin-updater");
        const update = await check();
        if (update?.available) {
          setUpdateAvailable(true);
          setUpdateVersion(update.version ?? "");
        }
      } catch {}
    };
    checkForUpdate();

    const fetchCommits = async () => {
      try {
        const res = await apiClient.get(endpoints.GET_COMMITS);
        setCommits(res.data.commits || []);
      } catch {
      }
    };

    fetchCommits();

    const streamUrl = `${endpoints.GET_COMMITS_STREAM}`;
    const sse = new EventSource(streamUrl);
    sse.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setCommits(data.commits || []);
      } catch {
      }
    };
    sse.onerror = () => {
      sse.close();
      fetchCommits();
    };

    const heartbeat = async () => {
      if (user?.accountId) {
        try {
          await apiClient.post("/launcher/heartbeat", { accountId: user.accountId });
        } catch {
        }
      }
    };

    heartbeat();

    const interval = setInterval(() => {
      fetchStatus();
      fetchFriends();
      heartbeat();
    }, 15000);
    return () => {
      clearInterval(interval);
      sse.close();
    };
  }, [user?.accountId]);

  const heroNews = news[0] ?? { title: "Welcome to Classified", body: "A custom Fortnite private server experience built for the community.", image: "/Battle_Pass_29_-_Fortnite.webp" };

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-black text-white overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-2 border-white/5" />
              <div className="absolute inset-0 rounded-full border-2 border-t-yellow-300 border-r-yellow-300/50 border-b-transparent border-l-transparent animate-spin" />
              <div className="absolute inset-2 rounded-full border border-t-yellow-200/30 border-transparent animate-spin" style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
            </div>
            <p className="text-xs text-gray-500 tracking-widest uppercase">Loading</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar />

      <motion.main
        className="flex-1 flex flex-col overflow-y-auto"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {updateAvailable && !updateDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between px-5 py-2.5 bg-yellow-300/10 border-b border-yellow-300/20 text-sm"
          >
            <div className="flex items-center gap-2 text-yellow-200">
              <Download className="w-4 h-4 shrink-0" />
              <span>Update available — <strong>v{updateVersion}</strong>. Restart to install.</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  try {
                    setUpdating(true);
                    const { check } = await import("@tauri-apps/plugin-updater");
                    const update = await check();
                    if (update?.available) await update.downloadAndInstall();
                  } catch { setUpdating(false); }
                }}
                disabled={updating}
                className="px-3 py-1 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black rounded text-xs font-semibold transition-colors"
              >
                {updating ? "Installing…" : "Install Now"}
              </button>
              <button onClick={() => setUpdateDismissed(true)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center px-7 pt-6 pb-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {(() => {
                const h = new Date().getHours();
                return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
              })()},{" "}
              <span className="text-yellow-300">{user?.displayName || user?.username || "Player"}</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5 tracking-wide">{status.activeLauncherUsers ?? 0} players in launcher right now</p>
          </div>

          <div className="flex items-center gap-3 bg-zinc-900/60 border border-yellow-400/15 rounded-xl px-4 py-2.5 backdrop-blur-sm">
            <div className="relative">
              <div className="h-8 w-8 rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center ring-2 ring-yellow-300/20">
                {(user as any)?.avatar ? (
                  <img src={(user as any).avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-black">
                    {(user?.displayName || user?.username || "P").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-black" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white leading-none">{user?.displayName || user?.username || "Player"}</p>
              <p className="text-[10px] text-green-400 mt-0.5">Online</p>
            </div>
          </div>
        </div>

        <div className="px-7 pb-7 space-y-4">
          {/* Hero banner */}
          <div
            className="relative h-[220px] overflow-hidden rounded-2xl cursor-pointer group border border-white/5 shadow-2xl"
            onClick={() => router.push("/library")}
          >
            <img
              src={heroNews.image}
              alt={heroNews.title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
              onError={(e) => { (e.target as HTMLImageElement).src = "/Battle_Pass_29_-_Fortnite.webp"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

            <div className="absolute bottom-4 left-5 max-w-[65%]">
              <p className="text-[10px] text-yellow-300/80 uppercase tracking-widest font-medium mb-1">Featured</p>
              <h2 className="text-base font-bold text-white leading-tight">{heroNews.title}</h2>
              <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">{heroNews.body}</p>
            </div>

            <div className="absolute bottom-4 right-4">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); router.push("/library"); }}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold rounded-full shadow-lg shadow-yellow-400/25 transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                Play Now
              </button>
            </div>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-3 gap-4">
            {/* Commits — spans 2 cols */}
            <div className="col-span-2 bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                <h2 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Launcher Updates</h2>
              </div>
              {commits.length === 0 ? (
                <div className="flex items-center justify-center h-24 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                  <p className="text-xs text-gray-600">No recent updates</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {commits.slice(0, 4).map((commit) => (
                    <a
                      key={commit.id}
                      href={commit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all border border-white/[0.04] block group/commit"
                    >
                      <p className="text-[10px] text-gray-600 mb-1">
                        {new Date(commit.date).toLocaleString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })}
                        {commit.repo ? ` · ${commit.repo}` : ""}
                      </p>
                      <h3 className="font-medium text-xs text-gray-200 group-hover/commit:text-white truncate mb-1 transition-colors">{commit.message}</h3>
                      <p className="text-[10px] text-gray-500">by {commit.author}</p>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-4">
              {/* Status */}
              <div className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-4 backdrop-blur-sm">
                <h2 className="text-xs font-semibold text-yellow-300/80 uppercase tracking-wider mb-3">Server Status</h2>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    status.status === "online" ? "bg-yellow-400 shadow-[0_0_6px_#4ade80]"
                    : status.status === "maintenance" ? "bg-yellow-300 shadow-[0_0_6px_#fde047]"
                    : "bg-red-400 shadow-[0_0_6px_#f87171]"
                  }`} />
                  <span className="text-xs text-gray-400 capitalize">{status.status}</span>
                </div>
                <p className="text-3xl font-bold text-white tabular-nums">{status.playersOnline}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">in-game</p>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-gray-500">
                  <Users className="w-3 h-3 text-yellow-300/60" />
                  <span>{status.activeLauncherUsers ?? 0} in launcher</span>
                </div>
              </div>

              {/* Friends */}
              <div className="flex-1 bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-semibold text-yellow-300/80 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Friends
                  </h2>
                  <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{friends.length}</span>
                </div>
                {friends.length > 0 ? (
                  <div className="space-y-1.5">
                    {friends.slice(0, 4).map((friend) => (
                      <div key={friend.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">
                        <div className="relative shrink-0">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-400/20 to-amber-400/10 border border-white/5 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-yellow-200">{friend.username.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-black ${
                            friend.status === "playing" ? "bg-emerald-400"
                            : friend.status === "online" ? "bg-green-400"
                            : friend.status === "away" ? "bg-yellow-300"
                            : "bg-gray-600"
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white truncate">{friend.username}</p>
                          <p className="text-[10px] text-gray-500 truncate capitalize">
                            {friend.status === "playing" && friend.location ? `Playing ${friend.location}` : friend.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-5 text-gray-600">
                    <Users className="w-5 h-5 mb-1.5 opacity-40" />
                    <span className="text-[10px]">No friends online</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
}