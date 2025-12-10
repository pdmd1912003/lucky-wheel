"use client"
import LuckyWheel from "@/components/lucky-wheel"
import WinnersDisplay from "@/components/winners-display"
import PrizesShowcase from "@/components/prizes-showcase"
import ControlPanel from "@/components/control-panel"
import { usePlayerStore } from "@/store/use-player-store"

export default function Home() {
  const { players, winners, prizes, addWinner, markPrizeUsed } = usePlayerStore()

  const segments = players.map((p) => p.name)

  const onFinished = (winnerName: string) => {
    const player = players.find((p) => p.name === winnerName)
    if (!player) return

    const availablePrizes = prizes.filter((p) => !p.used)
    if (availablePrizes.length === 0) {
      alert("No more prizes available")
      return
    }

    const randomPrize = availablePrizes[Math.floor(Math.random() * availablePrizes.length)]

    markPrizeUsed(randomPrize.id)
    addWinner(player, randomPrize.name)

    usePlayerStore.setState((state) => ({
      players: state.players.filter((p) => p.id !== player.id),
    }))

    alert(`${player.name} won: ${randomPrize.name}`)
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 pt-8">
          <h1 className="text-5xl md:text-6xl font-bold">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              SPIN
            </span>
            <span className="text-white"> LEGENDS</span>
          </h1>
          <p className="text-slate-400 text-lg tracking-wider">Web3 Lucky Draw Protocol</p>
          <div className="flex justify-center gap-2 pt-2">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-cyan-500"></div>
            <div className="w-0.5 h-0.5 rounded-full bg-cyan-500"></div>
            <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-purple-500"></div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Prizes */}
          <div className="lg:col-span-1 bg-slate-900/40 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6 h-fit">
            <PrizesShowcase />
          </div>

          {/* Center column - Wheel */}
          <div className="lg:col-span-1 bg-slate-900/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-8 flex items-center justify-center min-h-96 lg:min-h-fit">
            {segments.length > 0 ? (
              <LuckyWheel segments={segments} onFinished={onFinished} />
            ) : (
              <div className="text-center">
                <p className="text-slate-500">Import participants to start</p>
              </div>
            )}
          </div>

          {/* Right column - Winners */}
          <div className="lg:col-span-1 bg-slate-900/40 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6 h-fit">
            <WinnersDisplay />
          </div>
        </div>
      </div>

      <ControlPanel />
    </main>
  )
}
