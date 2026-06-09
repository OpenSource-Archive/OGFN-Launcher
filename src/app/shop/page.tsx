"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Star, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/splash-endpoints";
import Sidebar from "@/components/layout/Sidebar";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  rarity: string;
  image: string;
  type: string;
}

export default function ShopPage() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await apiClient.get(endpoints.GET_SHOP);
        setItems(res.data.items || res.data || []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, []);

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case "common":
        return "border-gray-400 text-gray-400";
      case "uncommon":
        return "border-green-400 text-green-400";
      case "rare":
        return "border-blue-400 text-blue-400";
      case "epic":
        return "border-purple-400 text-purple-400";
      case "legendary":
        return "border-yellow-400 text-yellow-400";
      default:
        return "border-cyan-400 text-cyan-400";
    }
  };

  return (
    <div className="flex h-screen bg-[#05070a] text-white overflow-hidden">
      <Sidebar />

      <motion.main
        className="flex-1 flex flex-col overflow-y-auto"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div className="px-6 pt-5 pb-2 flex items-center gap-3">
          <ShoppingBag className="w-6 h-6 text-cyan-400" />
          <h1 className="text-2xl font-bold text-white">Item Shop</h1>
        </div>

        <div className="px-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
          ) : items.length === 0 ? (
            <div className="bg-[#080a0f]/80 backdrop-blur-sm border border-white/10 shadow-lg rounded-xl p-6 text-center">
              <ShoppingBag className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-white mb-1">No Items Available</h2>
              <p className="text-sm text-gray-400">
                Check back later for new items.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-[#080a0f]/80 backdrop-blur-sm border-2 ${getRarityColor(item.rarity).split(" ")[0]} rounded-xl overflow-hidden shadow-lg transition-all hover:scale-[1.02]`}
                >
                  <div className="relative h-40 bg-gradient-to-b from-white/5 to-transparent">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain p-4"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                        {item.type}
                      </span>
                      <span className={`text-xs font-bold uppercase ${getRarityColor(item.rarity).split(" ")[1]}`}>
                        {item.rarity}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white mb-1">{item.name}</h3>
                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold text-yellow-400">{item.price}</span>
                      </div>
                      <button className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-md text-xs font-semibold text-white transition-colors">
                        Purchase
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.main>
    </div>
  );
}
