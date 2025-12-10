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
          <p className="text-sm text-slate-400 mt-1">{prizes.filter((p) => !p.used).length} remaining</p>
        </div>

        {/* Prizes grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {prizes.map((prize) => (
            <div
              key={prize.id}
              className={`relative group rounded-lg border overflow-hidden transition duration-300 ${
                prize.used
                  ? "border-slate-700/50 opacity-50 bg-slate-900/30"
                  : "border-cyan-500/40 bg-gradient-to-br from-slate-800 to-slate-800 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20"
              }`}
            >
              {/* Image */}
              <div className="relative h-24 overflow-hidden bg-slate-900">
                <img
                  src={prize.image || "/placeholder.svg"}
                  alt={prize.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
                {prize.used && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Check className="text-cyan-400" size={24} />
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="p-2 bg-slate-800/50 backdrop-blur-sm">
                <p className="text-xs font-semibold text-white truncate group-hover:text-cyan-400 transition">
                  {prize.name}
                </p>
                {prize.used && <p className="text-xs text-slate-500 mt-1">Claimed</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
