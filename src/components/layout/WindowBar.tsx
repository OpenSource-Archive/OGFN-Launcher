"use client";

import { Minus, X } from "lucide-react";
import { Window } from "@tauri-apps/api/window";

export default function WindowBar() {
  const close = async () => {
    try {
      const appWindow = new Window("main");
      await appWindow.close();
    } catch {
      console.error("Failed to close window");
    }
  };

  const minimize = async () => {
    try {
      const appWindow = new Window("main");
      await appWindow.minimize();
    } catch {
      console.error("Failed to minimize window");
    }
  };

  return (
    <div
      data-tauri-drag-region
      className="h-[34px] w-full flex justify-between items-center select-none absolute top-0 z-50"
    >
      <div />
      <div className="flex flex-row justify-end items-center h-full">
        <div
          onClick={minimize}
          className="cursor-pointer hover:transition-all hover:duration-300 w-12 h-full flex justify-center items-center hover:bg-white/5"
        >
          <Minus className="w-4 h-4 text-gray-300" />
        </div>
        <div
          onClick={close}
          className="cursor-pointer hover:transition-all hover:duration-300 w-12 h-full flex justify-center items-center hover:bg-red-500/80"
        >
          <X className="w-4 h-4 text-gray-300 hover:text-white" />
        </div>
      </div>
    </div>
  );
}
