"use client"

import { usePlayerStore } from "@/store/use-player-store"
import { Check } from "lucide-react"

export default function PrizesShowcase() {
  const { prizes } = usePlayerStore()

  if (prizes.length === 0) return null

  return (
    <div className="w-full">
      <div className="space-y-4">
        <div className="border-b border-purple-500/30 pb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Prize Pool
          </h2>
          <p className="text-sm text-slate-400 mt-1">{prizes.reduce((sum, p) => sum + p.quantity, 0)} remaining</p>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {prizes.map((prize) => (
            <div
              key={prize.id}
              className={`relative group rounded-lg border p-3 transition duration-300 ${
                prize.quantity === 0
                  ? "border-slate-700/50 opacity-50 bg-slate-900/30"
                  : "border-cyan-500/40 bg-gradient-to-br from-slate-800 to-slate-800 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white truncate group-hover:text-cyan-400 transition">
                    {prize.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {prize.quantity}/{prize.totalQuantity} remaining
                  </p>
                </div>
                {prize.quantity === 0 && (
                  <div className="flex-shrink-0 ml-2">
                    <Check className="text-cyan-400" size={20} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
