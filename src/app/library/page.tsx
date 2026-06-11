"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, Loader2, X, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HiPause, HiPlay, HiTrash } from "react-icons/hi";
import useBuildsStore, { IBuild } from "@/lib/stores/builds";
import Sidebar from "@/components/layout/Sidebar";
import {
  handleLaunchBuild,
  handleAddBuild,
  handleCloseBuild,
  checkifopen,
} from "@/lib/library/handlers";

export default function LibraryPage() {
  const buildState = useBuildsStore();
  const [mounted, setMounted] = useState(false);
  const [activeBuild, setActiveBuild] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredBuild, setHoveredBuild] = useState<string | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{
    progress: any;
    messages: any;
    speeds: any;
    files: string[];
    completed: string[];
  }>({
    progress: {},
    messages: {},
    speeds: {},
    files: [],
    completed: [],
  });

  useEffect(() => {
    setMounted(true);
    checkifopen(setActiveBuild);
  }, []);

  useEffect(() => {
    const allDownloadsComplete =
      downloadProgress.files.length === 0 ||
      (downloadProgress.files.length > 0 &&
        downloadProgress.completed.length === downloadProgress.files.length);

    if (!allDownloadsComplete) return;

    const timer = setTimeout(() => {
      setIsDownloadModalOpen(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [downloadProgress.completed, downloadProgress.files]);

  const handlelaunchBuild = async (path: string, version: string) => {
    await handleLaunchBuild(
      path,
      version,
      activeBuild || "",
      setActiveBuild,
      setIsDialogOpen,
      setDownloadProgress,
      setIsDownloadModalOpen
    );
  };

  const handleAdd = async () => {
    await handleAddBuild(setIsLoading);
  };

  const handleClose = async () => {
    await handleCloseBuild(setActiveBuild, setIsDialogOpen);
  };

  const builds = mounted ? (Array.from(buildState?.builds?.values() || []) as IBuild[]) : [];

  if (!mounted) {
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
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex-1 overflow-y-auto"
      >
        <div className="px-7 pt-6 pb-7 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Library</h1>
              <p className="text-xs text-gray-500 mt-0.5">{builds.length} build{builds.length !== 1 ? "s" : ""} installed</p>
            </div>
            <button
              onClick={() => handleAdd()}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed text-black text-sm font-semibold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-yellow-400/20"
            >
              {isLoading ? (
                <>
                  <div className="relative w-4 h-4">
                    <div className="absolute inset-0 rounded-full border-2 border-black/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-black border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                  </div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Build
                </>
              )}
            </button>
          </div>

          {builds.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
              <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mb-3">
                <Plus className="w-6 h-6 text-yellow-300/60" />
              </div>
              <p className="text-sm text-gray-400 font-medium">No builds yet</p>
              <p className="text-xs text-gray-600 mt-1">Click "Add Build" to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {builds.map((build, index) => {
                if (!build) return null;
                const versionNumber = Number(build.version);
                const isActive = activeBuild === build.path;
                const chapter = versionNumber <= 10.4 ? "Chapter 1" : versionNumber <= 18.4 ? "Chapter 2" : "Chapter 3";

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group relative bg-zinc-900/50 border rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "border-yellow-400/40 shadow-lg shadow-yellow-400/10"
                        : "border-white/[0.06] hover:border-white/[0.12] hover:shadow-xl hover:shadow-black/40"
                    } ${activeBuild !== null && !isActive ? "opacity-40 pointer-events-none" : ""}`}
                    onMouseEnter={() => setHoveredBuild(build.path)}
                    onMouseLeave={() => setHoveredBuild(null)}
                    onClick={() => {
                      if (activeBuild === null || isActive) handlelaunchBuild(build.path, build.version);
                    }}
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={build.splash || "/placeholder.svg"}
                        alt={`v${build.version}`}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        width={240}
                        height={160}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                      {isActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
                          <div className="flex flex-col items-center gap-2">
                            <HiPause className="h-10 w-10 text-yellow-300" />
                            <span className="text-[10px] text-yellow-300 font-medium tracking-wider uppercase">Running</span>
                          </div>
                        </div>
                      )}
                      {hoveredBuild === build.path && !isActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px] transition-all">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/40">
                              <HiPlay className="h-5 w-5 text-black ml-0.5" />
                            </div>
                            <span className="text-[10px] text-white font-medium tracking-wider uppercase">Launch</span>
                          </div>
                        </div>
                      )}

                      <div className="absolute top-2 right-2">
                        <span className="text-[10px] text-gray-300 bg-black/50 backdrop-blur-sm border border-white/10 px-2 py-0.5 rounded-full">{chapter}</span>
                      </div>
                    </div>

                    <div className="p-3.5">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="font-semibold text-white text-sm">v{build.version}</p>
                          <p className="text-[11px] text-gray-500 truncate mt-0.5">{build.real}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            buildState?.remove?.(build.path);
                          }}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
                          aria-label={`Remove v${build.version}`}
                        >
                          <HiTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.main>

      {/* Close Game Dialog */}
      <AnimatePresence>
        {isDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-zinc-900 border border-white/10 p-6 rounded-2xl max-w-sm w-full mx-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <h2 className="text-base font-bold text-white">Close Game</h2>
              </div>
              <p className="text-sm text-gray-400 mb-6">Are you sure you want to close your game?</p>
              <div className="flex gap-3">
                <button
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-400 text-white rounded-xl text-sm font-semibold transition-colors"
                  onClick={handleClose}
                >
                  Close Game
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Download Modal */}
      <AnimatePresence>
        {isDownloadModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-yellow-400/20 bg-zinc-900 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8">
                    <div className="absolute inset-0 rounded-full border-2 border-white/5" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-yellow-300 border-r-yellow-300/40 border-b-transparent border-l-transparent animate-spin" />
                  </div>
                  <h2 className="text-sm font-semibold text-white">Downloading Files</h2>
                </div>
                {downloadProgress.completed.length === downloadProgress.files.length && (
                  <button
                    onClick={() => setIsDownloadModalOpen(false)}
                    className="rounded-lg p-1.5 text-gray-500 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-gray-400">{downloadProgress.completed.length}/{downloadProgress.files.length} files</span>
                  <span className="text-gray-500">
                    {Math.round(downloadProgress.files.length > 0 ? (downloadProgress.completed.length / downloadProgress.files.length) * 100 : 0)}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${downloadProgress.files.length > 0 ? (downloadProgress.completed.length / downloadProgress.files.length) * 100 : 0}%` }}
                    transition={{ type: "spring", damping: 20, stiffness: 60 }}
                    className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-2 space-y-1">
                <AnimatePresence mode="wait">
                  {downloadProgress.files.map((file) => {
                    const isCurrentFile =
                      !downloadProgress.completed.includes(file) &&
                      downloadProgress.files.indexOf(file) === downloadProgress.files.findIndex((f) => !downloadProgress.completed.includes(f));
                    const isLastCompleted =
                      downloadProgress.completed.length === downloadProgress.files.length &&
                      file === downloadProgress.files[downloadProgress.files.length - 1];
                    if (!isCurrentFile && !isLastCompleted) return null;

                    const isCompleted = downloadProgress.completed.includes(file);
                    const fileExtension = file.split(".").pop();
                    const downloadSpeed = downloadProgress.speeds?.[file] || 0;
                    const progress = downloadProgress.progress?.[file] || 0;
                    const statusMessage = downloadProgress.messages?.[file] || "";
                    const isError = statusMessage.startsWith("Error");

                    return (
                      <motion.div
                        key={file}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className={`flex items-center gap-3 rounded-lg p-2.5 ${isError ? "bg-red-500/10" : isCompleted ? "bg-white/[0.03]" : "bg-white/[0.02]"}`}
                      >
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-white/5 border border-white/[0.06] flex items-center justify-center">
                          <FileText className="h-3.5 w-3.5 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-xs font-medium text-gray-200">{file}</p>
                          {statusMessage && (
                            <p className={`text-[10px] mt-0.5 ${isError ? "text-red-400" : "text-gray-500"}`}>{statusMessage}</p>
                          )}
                          {!isCompleted && !isError && (
                            <div className="mt-1.5">
                              <div className="h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-300 rounded-full transition-all" style={{ width: `${progress}%` }} />
                              </div>
                              <div className="flex justify-between text-[10px] mt-1 text-gray-500">
                                <span>{Math.round(progress)}%</span>
                                {downloadSpeed > 0 && <span>{downloadSpeed.toFixed(1)} MB/s</span>}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="shrink-0">
                          {isError ? (
                            <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                              <X className="h-3 w-3 text-red-400" />
                            </div>
                          ) : isCompleted ? (
                            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                              <FileText className="h-3 w-3 text-green-400" />
                            </div>
                          ) : (
                            <div className="relative w-6 h-6">
                              <div className="absolute inset-0 rounded-full border border-white/5" />
                              <div className="absolute inset-0 rounded-full border border-t-yellow-300 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                  {downloadProgress.completed.length === downloadProgress.files.length && downloadProgress.files.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pt-2 text-center text-xs text-green-400 font-medium"
                    >
                      All downloads complete!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}