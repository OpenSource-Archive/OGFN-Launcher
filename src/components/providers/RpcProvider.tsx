"use client";

import { useDiscordRpc } from "@/lib/hooks/use-discord-rpc";

export default function RpcProvider() {
  useDiscordRpc();
  return null;
}
