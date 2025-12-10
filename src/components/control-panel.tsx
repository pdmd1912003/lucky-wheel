"use client"

import type React from "react"

import { useState, useRef } from "react"
import { read, utils, writeFile } from "xlsx"
import { usePlayerStore } from "@/store/use-player-store"
import { Upload, Download, Settings } from "lucide-react"

export default function ControlPanel() {
  const { players, setPlayers, prizes, addPrize, winners, clearWinners } = usePlayerStore()

  const [isExpanded, setIsExpanded] = useState(false)
  const [prizeName, setPrizeName] = useState("")
  const [prizeImage, setPrizeImage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const bstr = evt.target?.result
      const wb = read(bstr, { type: "binary" })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const data = utils.sheet_to_json(ws) as Record<string, any>[]

      const importedPlayers = data.map((row, index) => {
        const name = row.name?.toString().trim()
        let studentId = ""

        if (row.email) {
          const match = row.email
            .toString()
            .trim()
            .match(/^(\d+t\d+)@/)
          if (match) studentId = match[1]
        }

        const displayName = studentId ? `${name} (${studentId})` : name

        return {
          id: Date.now().toString() + index,
          name: displayName,
          studentId,
          rawData: row,
          prize: "",
        }
      })

      setPlayers(importedPlayers)
      alert(`Imported ${importedPlayers.length} participants`)
    }
    reader.readAsBinaryString(file)
  }

  const handleExport = () => {
    if (winners.length === 0) {
      alert("No winners to export")
      return
    }

    const first = winners[0]
    const cols = first.rawData ? Object.keys(first.rawData) : ["name"]
    const headers = [...cols, "Prize"]

    const rows = winners.map((w) => {
      const row = cols.map((c) => w.rawData?.[c] ?? "")
      row.push(w.prize || "")
      return row
    })

    const ws = utils.aoa_to_sheet([headers, ...rows])
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, "Winners")
    writeFile(wb, "Winners_Results.xlsx")
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isExpanded && (
        <div className="mb-4 bg-slate-900 border border-purple-500 rounded-lg p-4 backdrop-blur-sm shadow-lg shadow-purple-500/20 w-80 space-y-4 animate-in fade-in slide-in-from-bottom-4">
          {/* Prize Management */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Add Prize</h3>
            <input
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition"
              placeholder="Prize name"
              value={prizeName}
              onChange={(e) => setPrizeName(e.target.value)}
            />
            <input
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition"
              placeholder="Image URL"
              value={prizeImage}
              onChange={(e) => setPrizeImage(e.target.value)}
            />
            <button
              onClick={() => {
                if (!prizeName || !prizeImage) return
                addPrize(prizeName, prizeImage)
                setPrizeName("")
                setPrizeImage("")
              }}
              className="w-full px-3 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-slate-950 font-semibold text-sm rounded hover:shadow-lg hover:shadow-cyan-500/50 transition"
            >
              Add
            </button>
          </div>

          {/* Import/Export */}
          <div className="space-y-2 pt-3 border-t border-slate-700">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded hover:border-cyan-400 hover:text-cyan-400 transition"
            >
              <Upload size={16} />
              Import Excel
            </button>
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded hover:border-cyan-400 hover:text-cyan-400 transition"
            >
              <Download size={16} />
              Export Results
            </button>
            <button
              onClick={clearWinners}
              className="w-full px-3 py-2 bg-slate-800 border border-red-500/30 text-red-400 text-sm rounded hover:border-red-500 hover:bg-red-500/10 transition"
            >
              Clear Winners
            </button>
          </div>

          {/* Stats */}
          <div className="pt-3 border-t border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Participants:</span>
              <span className="text-cyan-400 font-semibold">{players.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Prizes:</span>
              <span className="text-cyan-400 font-semibold">{prizes.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Winners:</span>
              <span className="text-cyan-400 font-semibold">{winners.length}</span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-slate-950 shadow-lg shadow-purple-500/50 hover:scale-110 transition border border-cyan-300 glow"
      >
        <Settings size={24} className={`transition-transform ${isExpanded ? "rotate-45" : ""}`} />
      </button>

      <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} className="hidden" />
    </div>
  )
}
