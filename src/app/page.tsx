"use client"
import { usePlayerStore } from "@/store/use-player-store"
import LuckyWheel from "@/components/lucky-wheel"
import WinnersDisplay from "@/components/winners-display"
import PrizesShowcase from "@/components/prizes-showcase"
import ControlPanel from "@/components/control-panel"

export default function Home() {
  const { players, prizes, addWinner, removePlayer } = usePlayerStore()
  const prizeNames = prizes.map((p) => p.name)

  const handleWinnerSelected = (winner: string) => {
    if (winner && prizeNames.length > 0) {
      const randomPrize = prizeNames[Math.floor(Math.random() * prizeNames.length)]
      const playerObj = players.find((p) => p.name === winner)
      if (playerObj) {
        addWinner(playerObj, randomPrize)
        // Remove winner from players list
        removePlayer(playerObj.id)
      }
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,245,255,0.1),rgba(168,85,247,0.1))] text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2 tracking-tighter">
            LUCKY SPIN
          </h1>
          <p className="text-slate-300 text-lg">Cyberpunk Raffle Protocol v1.0</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/50 border border-purple-500/30 rounded-lg p-6 backdrop-blur-sm">
              <PrizesShowcase />
            </div>

            <div className="bg-slate-900/50 border border-purple-500/30 rounded-lg p-6 backdrop-blur-sm">
              <WinnersDisplay />
            </div>
          </div>

          {/* Center Panel - Wheel */}
          <div className="lg:col-span-1 flex flex-col items-center justify-center">
            <div className="w-full flex justify-center">
              <div className="bg-slate-900/30 border border-cyan-500/20 rounded-lg p-8 backdrop-blur-sm w-full max-w-lg">
                <LuckyWheel segments={players.map((p) => p.name)} onFinished={handleWinnerSelected} />
              </div>
            </div>
          </div>

          {/* Right Panel - Stats */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/50 border border-purple-500/30 rounded-lg p-6 backdrop-blur-sm sticky top-8">
              <h3 className="text-xl font-bold text-cyan-400 mb-6 uppercase tracking-wider">System Status</h3>

              <div className="space-y-4">
                <div className="bg-slate-800/50 p-4 rounded border border-slate-700/50">
                  <div className="text-slate-400 text-sm uppercase tracking-wider mb-1">Active Players</div>
                  <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    {players.length}
                  </div>
                </div>

                <div className="bg-slate-800/50 p-4 rounded border border-slate-700/50">
                  <div className="text-slate-400 text-sm uppercase tracking-wider mb-1">Prize Pool</div>
                  <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    {prizes.length}
                  </div>
                </div>

                <div className="bg-slate-800/50 p-4 rounded border border-slate-700/50">
                  <div className="text-slate-400 text-sm uppercase tracking-wider mb-1">Draws Complete</div>
                  <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    0
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded text-xs text-slate-300 leading-relaxed">
                  <p className="font-semibold text-cyan-400 mb-2">Protocol Active</p>
                  Ready for lucky draw operations. Add participants and prizes to begin spinning the wheel.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ControlPanel />
    </main>
  )
}
