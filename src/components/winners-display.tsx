"use client"

import { usePlayerStore } from "@/store/use-player-store"

export default function WinnersDisplay() {
  const { winners } = usePlayerStore()

  return (
    <div className="w-full">
      <div className="space-y-4">
        <div className="border-b border-purple-500/30 pb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Champions Registry
          </h2>
          <p className="text-sm text-slate-400 mt-1">{winners.length} victors claimed</p>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {winners.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-sm">Awaiting first winner...</p>
            </div>
          ) : (
            winners.map((winner, idx) => (
              <div
                key={winner.id}
                className="group relative bg-gradient-to-r from-slate-800 to-slate-800 border border-purple-500/40 rounded-lg p-4 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition duration-300"
              >
                <div className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 text-slate-950 font-bold text-sm">
                  #{idx + 1}
                </div>

                <div className="pr-8">
                  <p className="font-semibold text-white group-hover:text-cyan-400 transition">{winner.name}</p>
                  <p className="text-sm text-purple-300 mt-1">{winner.prize}</p>
                </div>

                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/0 via-purple-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 group-hover:via-purple-500/10 group-hover:to-cyan-500/5 pointer-events-none transition"></div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
