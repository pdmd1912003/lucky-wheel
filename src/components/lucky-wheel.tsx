"use client"

import { useEffect, useRef, useState } from "react"
import { usePlayerStore } from "@/store/use-player-store"
import ConfirmModal from "./confirm-modal"

interface LuckyWheelProps {
  segments?: string[]
  onFinished: (winner: string) => void
}

// --- CYBERPUNK PALETTE ---
const COLORS = [
  "#00f5ff", // Neon Cyan
  "#a855f7", // Electric Purple
  "#06b6d4", // Tech Teal
  "#d946ef", // Hot Pink (Accent)
]

export default function LuckyWheel({ segments = [], onFinished }: LuckyWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [currentRotation, setCurrentRotation] = useState(0)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingWinner, setPendingWinner] = useState("")
  const [pendingPrize, setPendingPrize] = useState("")
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    title: string
    message: string
    type?: "info" | "warning" | "error" | "success"
  }>({
    isOpen: false,
    title: "",
    message: "",
  })

  const { decreasePrizeQuantity, addWinner, prizes, removePlayer, players } = usePlayerStore()

  const size = 500
  const centerX = size / 2
  const centerY = size / 2
  const radius = size / 2 - 20

  const safeSegments = segments || []

  const drawWheel = (rotationAngle: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, size, size)

    const numSegments = safeSegments.length
    if (numSegments === 0) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.strokeStyle = "rgba(0, 245, 255, 0.3)"
      ctx.lineWidth = 4
      ctx.stroke()
      return
    }

    const sliceAngle = (2 * Math.PI) / numSegments
    const startAngleOffset = (rotationAngle * Math.PI) / 180

    safeSegments.forEach((segment, i) => {
      const startAngle = startAngleOffset + i * sliceAngle
      const endAngle = startAngle + sliceAngle

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()

      ctx.fillStyle = COLORS[i % COLORS.length]
      ctx.fill()

      ctx.lineWidth = 2
      ctx.strokeStyle = "#0f172a"
      ctx.stroke()

      ctx.save()
      ctx.translate(centerX, centerY)
      const midAngle = startAngle + sliceAngle / 2
      ctx.rotate(midAngle)
      ctx.translate(radius * 0.55, 0)

      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "#0f172a"
      ctx.font = "900 14px 'Orbitron', sans-serif"

      ctx.shadowColor = "rgba(255,255,255,0.5)"
      ctx.shadowBlur = 0

      let text = segment || ""
      if (text.length > 18) {
        text = text.substring(0, 15) + "..."
      }

      ctx.fillText(text.toUpperCase(), 0, 0)
      ctx.restore()
    })

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.2, 0, 2 * Math.PI)
    ctx.fillStyle = "#0f172a"
    ctx.fill()
    ctx.strokeStyle = "#00f5ff"
    ctx.lineWidth = 2
    ctx.stroke()
  }

  useEffect(() => {
    drawWheel(currentRotation)
  }, [safeSegments, currentRotation])

  const spin = () => {
    if (isSpinning || safeSegments.length === 0) return

    setIsSpinning(true)
    const spinAngle = 360 * 5 + Math.floor(Math.random() * 360)
    const targetRotation = currentRotation + spinAngle
    const duration = 5000
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      if (elapsed < duration) {
        const t = elapsed / duration
        const easeOut = 1 - Math.pow(1 - t, 4)
        const currentAngle = currentRotation + spinAngle * easeOut
        setCurrentRotation(currentAngle)
        requestAnimationFrame(animate)
      } else {
        setCurrentRotation(targetRotation)
        setIsSpinning(false)
        calculateWinner(targetRotation)
      }
    }
    requestAnimationFrame(animate)
  }

  const calculateWinner = (finalRotation: number) => {
    const numSegments = safeSegments.length
    if (numSegments === 0) return
    const sliceAngle = 360 / numSegments
    const normalizedRotation = finalRotation % 360
    const pointerAngle = 270
    const effectiveAngle = (pointerAngle - normalizedRotation + 360) % 360
    const winningIndex = Math.floor(effectiveAngle / sliceAngle)

    if (safeSegments[winningIndex]) {
      setPendingWinner(safeSegments[winningIndex])
      const availablePrizes = prizes.filter((p) => p.quantity > 0)
      if (availablePrizes.length > 0) {
        const randomPrize = availablePrizes[Math.floor(Math.random() * availablePrizes.length)]
        setPendingPrize(randomPrize.name)
        setShowConfirm(true)
      } else {
        setModalState({
          isOpen: true,
          title: "No Prizes",
          message: "No prizes remaining!",
          type: "warning",
        })
        setPendingWinner("")
      }
    }
  }

  const handleConfirm = () => {
    if (pendingWinner && pendingPrize) {
      const player = players.find((p) => p.name === pendingWinner)
      if (player) {
        addWinner(
          {
            id: player.id,
            name: pendingWinner,
            studentId: player.studentId,
            rawData: player.rawData,
            prize: pendingPrize,
          },
          pendingPrize,
        )
        // Find and decrease prize quantity
        const prize = prizes.find((p) => p.name === pendingPrize)
        if (prize) {
          decreasePrizeQuantity(prize.id)
        }
        // Remove winner from players list
        removePlayer(player.id)
        onFinished(pendingWinner)
      }
    }
    setShowConfirm(false)
    setPendingWinner("")
    setPendingPrize("")
  }

  const handleCancel = () => {
    setShowConfirm(false)
    setPendingWinner("")
    setPendingPrize("")
  }

  return (
    <div className="relative flex flex-col items-center gap-10 w-full z-10">
      <div className="relative group">
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-30 filter drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]">
          <div className="w-8 h-10 bg-gradient-to-b from-red-500 to-red-700 [clip-path:polygon(50%_100%,0_0,100%_0)]"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-200 rounded-full shadow-lg"></div>
        </div>

        <div className="relative p-2 rounded-full bg-gradient-to-b from-slate-800 to-black border-2 border-cyan-500/30 shadow-[0_0_60px_rgba(0,245,255,0.2)]">
          <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-[spin_10s_linear_infinite]"></div>
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-purple-500/30 animate-[spin_15s_linear_infinite_reverse]"></div>

          <div className="bg-[#050b14] rounded-full p-1 relative overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              width={size}
              height={size}
              className="max-w-full h-auto rounded-full relative z-10"
            />

            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 rounded-full pointer-events-none z-20 mix-blend-overlay"></div>
          </div>
        </div>

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 z-20 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-slate-900 rounded-full border-4 border-cyan-400 shadow-[0_0_20px_#00f5ff]"></div>
          <div className="absolute inset-2 bg-slate-800 rounded-full border border-slate-600 flex items-center justify-center">
            <div className="w-8 h-8 bg-cyan-400 rounded-full shadow-[0_0_15px_#00f5ff] animate-pulse"></div>
          </div>
        </div>
      </div>

      <button
        onClick={spin}
        disabled={isSpinning || safeSegments.length === 0}
        className="relative group overflow-hidden px-16 py-5 bg-transparent text-cyan-400 font-black text-xl tracking-[0.2em] uppercase border-2 border-cyan-500/50 hover:bg-cyan-500/10 hover:border-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_30px_rgba(0,245,255,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
        style={{
          clipPath: "polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)",
        }}
      >
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent skew-x-12"></div>

        <span className="relative z-10 flex items-center gap-3">{isSpinning ? "PROCESSING..." : "SPIN PROTOCOL"}</span>
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-cyan-500 rounded-lg p-8 max-w-md w-full shadow-lg shadow-cyan-500/50">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">Confirm Winner</h2>
            <div className="space-y-4 mb-6">
              <div className="bg-slate-800 p-3 rounded">
                <p className="text-slate-400 text-sm">Winner</p>
                <p className="text-cyan-400 font-semibold text-lg">{pendingWinner}</p>
              </div>
              <div className="bg-slate-800 p-3 rounded">
                <p className="text-slate-400 text-sm">Prize</p>
                <p className="text-purple-400 font-semibold text-lg">{pendingPrize}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-slate-950 font-bold rounded hover:shadow-lg hover:shadow-cyan-500/50 transition"
              >
                Confirm
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 font-bold rounded hover:bg-slate-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText="OK"
        onConfirm={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        onCancel={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}
