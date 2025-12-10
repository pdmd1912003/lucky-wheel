"use client"

import { useEffect, useRef, useState } from "react"

interface LuckyWheelProps {
  segments?: string[] 
  onFinished: (winner: string) => void
}

// --- CYBERPUNK PALETTE ---
const COLORS = [
  "#00f5ff", // Neon Cyan
  "#a855f7", // Electric Purple
  "#06b6d4", // Tech Teal
  "#d946ef", // Hot Pink (Accent) - thêm 1 màu để tạo tương phản nếu cần
]

export default function LuckyWheel({ segments = [], onFinished }: LuckyWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [currentRotation, setCurrentRotation] = useState(0)

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
      // Vẽ vòng tròn chờ kiểu Tech
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

      // 1. Vẽ miếng bánh (Slice)
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()
      
      // Tô màu
      ctx.fillStyle = COLORS[i % COLORS.length]
      ctx.fill()
      
      // Viền Neon giữa các miếng
      ctx.lineWidth = 2
      ctx.strokeStyle = "#0f172a" // Màu nền tối để tạo khe hở
      ctx.stroke()

      // 2. Vẽ Text
      ctx.save()
      ctx.translate(centerX, centerY)
      const midAngle = startAngle + sliceAngle / 2
      ctx.rotate(midAngle)
      ctx.translate(radius * 0.55, 0) // Dịch chuyển chữ vào trong một chút
      
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "#0f172a" // Chữ màu tối trên nền Neon sáng
      ctx.font = "900 14px 'Orbitron', sans-serif" // Font đậm chất Cyber (nếu có) hoặc sans-serif đậm
      
      // Text Glow nhẹ
      ctx.shadowColor = "rgba(255,255,255,0.5)"
      ctx.shadowBlur = 0
      
      let text = segment || ""
      if (text.length > 18) {
        text = text.substring(0, 15) + "..."
      }
      
      ctx.fillText(text.toUpperCase(), 0, 0)
      ctx.restore()
    })

    // 3. Vẽ vòng tròn trang trí bên trong (Inner Tech Ring)
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.2, 0, 2 * Math.PI)
    ctx.fillStyle = "#0f172a" // Lõi tối
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
      onFinished(safeSegments[winningIndex])
    }
  }

  return (
    <div className="relative flex flex-col items-center gap-10 w-full z-10">
      {/* Container chứa Wheel */}
      <div className="relative group">
        {/* 1. Pointer - Hình tam giác công nghệ */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-30 filter drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]">
          <div className="w-8 h-10 bg-gradient-to-b from-red-500 to-red-700 [clip-path:polygon(50%_100%,0_0,100%_0)]"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-200 rounded-full shadow-lg"></div>
        </div>

        {/* 2. Outer Ring Glow - Cyberpunk Reactor Effect */}
        <div className="relative p-2 rounded-full bg-gradient-to-b from-slate-800 to-black border-2 border-cyan-500/30 shadow-[0_0_60px_rgba(0,245,255,0.2)]">
          {/* Vòng sáng chạy xung quanh */}
          <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-[spin_10s_linear_infinite]"></div>
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-purple-500/30 animate-[spin_15s_linear_infinite_reverse]"></div>

          <div className="bg-[#050b14] rounded-full p-1 relative overflow-hidden shadow-inner">
            <canvas 
              ref={canvasRef} 
              width={size} 
              height={size} 
              className="max-w-full h-auto rounded-full relative z-10"
            />
            
            {/* Hiệu ứng ánh sáng nền phản chiếu */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 rounded-full pointer-events-none z-20 mix-blend-overlay"></div>
          </div>
        </div>

        {/* 3. Center Hub - Lõi phản ứng */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 z-20 flex items-center justify-center pointer-events-none">
           <div className="absolute inset-0 bg-slate-900 rounded-full border-4 border-cyan-400 shadow-[0_0_20px_#00f5ff]"></div>
           <div className="absolute inset-2 bg-slate-800 rounded-full border border-slate-600 flex items-center justify-center">
              <div className="w-8 h-8 bg-cyan-400 rounded-full shadow-[0_0_15px_#00f5ff] animate-pulse"></div>
           </div>
        </div>
      </div>

      {/* Button - Cyberpunk Style */}
      <button
        onClick={spin}
        disabled={isSpinning || safeSegments.length === 0}
        className="
          relative group overflow-hidden
          px-16 py-5
          bg-transparent
          text-cyan-400 font-black text-xl tracking-[0.2em] uppercase
          border-2 border-cyan-500/50
          hover:bg-cyan-500/10 hover:border-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_30px_rgba(0,245,255,0.4)]
          active:scale-95
          transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale
          clip-path-polygon
        "
        style={{
            clipPath: "polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)"
        }}
      >
        {/* Hiệu ứng quét ngang nút */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent skew-x-12"></div>
        
        <span className="relative z-10 flex items-center gap-3">
           {isSpinning ? "PROCESSING..." : "SPIN PROTOCOL"}
        </span>
      </button>
    </div>
  )
}