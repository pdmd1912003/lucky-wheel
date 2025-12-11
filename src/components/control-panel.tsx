"use client"

import type React from "react"

import { useState, useRef } from "react"
import { read, utils, writeFile } from "xlsx"
import { usePlayerStore } from "@/store/use-player-store"
import { Upload, Download, Settings, Trash2 } from "lucide-react"
import ConfirmModal from "./confirm-modal"

export default function ControlPanel() {
  const { players, setPlayers, prizes, addPrize, winners, clearWinners, addPlayer, removePlayer } = usePlayerStore()

  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<"participants" | "prizes" | "import" | "stats">("participants")
  const [prizeName, setPrizeName] = useState("")
  const [prizeImage, setPrizeImage] = useState("")
  const [prizeQuantity, setPrizeQuantity] = useState("1")
  const [playerName, setPlayerName] = useState("")
  const [playerStudentId, setPlayerStudentId] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [modalState, setModalState] = useState<{
    isOpen: boolean
    title: string
    message: string
    description?: string
    confirmText?: string
    type?: "info" | "warning" | "error" | "success"
    onConfirm: () => void
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  })

  const showModal = (config: Omit<typeof modalState, "onConfirm"> & { onConfirm: () => void }) => {
    setModalState(config)
  }

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }))
  }

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
      showModal({
        isOpen: true,
        title: "Import Success",
        message: `Imported ${importedPlayers.length} participants`,
        type: "success",
        confirmText: "OK",
        onConfirm: closeModal,
      })
    }
    reader.readAsBinaryString(file)
  }

  const handleExport = () => {
    if (winners.length === 0) {
      showModal({
        isOpen: true,
        title: "No Winners",
        message: "No winners to export",
        type: "warning",
        confirmText: "OK",
        onConfirm: closeModal,
      })
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

  const handleAddPlayer = () => {
    if (!playerName.trim()) {
      showModal({
        isOpen: true,
        title: "Invalid Input",
        message: "Please enter a player name",
        type: "error",
        confirmText: "OK",
        onConfirm: closeModal,
      })
      return
    }
    addPlayer(playerName, playerStudentId || undefined)
    const tempName = playerName
    setPlayerName("")
    setPlayerStudentId("")
    showModal({
      isOpen: true,
      title: "Player Added",
      message: `Added ${tempName} to participants`,
      type: "success",
      confirmText: "OK",
      onConfirm: closeModal,
    })
  }

  const handleAddPrize = () => {
    if (!prizeName || !prizeImage) return
    const quantity = Number.parseInt(prizeQuantity) || 1
    addPrize(prizeName, prizeImage, quantity)
    setPrizeName("")
    setPrizeImage("")
    setPrizeQuantity("1")
  }

  const tabButtonClass = (tab: string) =>
    `px-3 py-2 text-xs font-semibold uppercase tracking-wider transition border-b-2 ${
      activeTab === tab ? "text-cyan-400 border-cyan-400" : "text-slate-400 border-transparent hover:text-cyan-400"
    }`

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isExpanded && (
        <div className="mb-4 bg-slate-900 border border-purple-500 rounded-lg backdrop-blur-sm shadow-lg shadow-purple-500/20 w-96 animate-in fade-in slide-in-from-bottom-4 max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex gap-1 border-b border-slate-700 bg-slate-800/50 px-4 pt-3 flex-shrink-0">
            <button onClick={() => setActiveTab("participants")} className={tabButtonClass("participants")}>
              Participants
            </button>
            <button onClick={() => setActiveTab("prizes")} className={tabButtonClass("prizes")}>
              Prizes
            </button>
            <button onClick={() => setActiveTab("import")} className={tabButtonClass("import")}>
              Import/Export
            </button>
            <button onClick={() => setActiveTab("stats")} className={tabButtonClass("stats")}>
              Stats
            </button>
          </div>

          <div className="p-4 overflow-y-auto flex-1">
            {activeTab === "participants" && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                  Add Participant Manually
                </h3>
                <input
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition"
                  placeholder="Participant name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddPlayer()}
                />
                <input
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition"
                  placeholder="Student ID (optional)"
                  value={playerStudentId}
                  onChange={(e) => setPlayerStudentId(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddPlayer()}
                />
                <button
                  onClick={handleAddPlayer}
                  className="w-full px-3 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-slate-950 font-semibold text-sm rounded hover:shadow-lg hover:shadow-cyan-500/50 transition"
                >
                  Add Participant
                </button>

                {players.length > 0 && (
                  <div className="pt-3 border-t border-slate-700">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Quick Remove</h3>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {players.slice(-8).map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between bg-slate-800 p-2 rounded text-xs group"
                        >
                          <span className="text-slate-300 truncate">{p.name}</span>
                          <button
                            onClick={() => removePlayer(p.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "prizes" && (
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
                <input
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition"
                  type="number"
                  placeholder="Quantity"
                  value={prizeQuantity}
                  onChange={(e) => setPrizeQuantity(e.target.value)}
                  min="1"
                />
                <button
                  onClick={handleAddPrize}
                  className="w-full px-3 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-slate-950 font-semibold text-sm rounded hover:shadow-lg hover:shadow-cyan-500/50 transition"
                >
                  Add Prize
                </button>

                {prizes.length > 0 && (
                  <div className="pt-3 border-t border-slate-700">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Current Prizes ({prizes.length})
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {prizes.map((prize, idx) => (
                        <div key={idx} className="bg-slate-800 p-2 rounded text-xs">
                          <div className="flex justify-between items-center">
                            <div className="text-cyan-400 font-semibold">{prize.name}</div>
                            <div className="text-purple-400 text-xs">
                              {prize.quantity}/{prize.totalQuantity}
                            </div>
                          </div>
                          <div className="text-slate-400 text-xs mt-1">Image: {prize.image.slice(0, 25)}...</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "import" && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Import / Export</h3>
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
                  onClick={() =>
                    showModal({
                      isOpen: true,
                      title: "Clear Winners",
                      message: "Are you sure you want to clear all winners?",
                      description: "This action cannot be undone.",
                      confirmText: "Clear",
                      type: "warning",
                      onConfirm: () => {
                        clearWinners()
                        closeModal()
                        showModal({
                          isOpen: true,
                          title: "Cleared",
                          message: "All winners have been cleared",
                          type: "success",
                          confirmText: "OK",
                          onConfirm: closeModal,
                        })
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-red-500/30 text-red-400 text-sm rounded hover:border-red-500 hover:bg-red-500/10 transition"
                >
                  Clear Winners
                </button>
              </div>
            )}

            {activeTab === "stats" && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Statistics</h3>
                <div className="space-y-3">
                  <div className="bg-slate-800 p-3 rounded">
                    <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Participants</div>
                    <div className="text-2xl font-bold text-cyan-400">{players.length}</div>
                  </div>
                  <div className="bg-slate-800 p-3 rounded">
                    <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Prizes</div>
                    <div className="text-2xl font-bold text-cyan-400">{prizes.length}</div>
                  </div>
                  <div className="bg-slate-800 p-3 rounded">
                    <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Winners</div>
                    <div className="text-2xl font-bold text-cyan-400">{winners.length}</div>
                  </div>
                  <div className="bg-slate-800 p-3 rounded">
                    <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Prizes Remaining</div>
                    <div className="text-2xl font-bold text-purple-400">
                      {prizes.reduce((acc, p) => acc + p.quantity, 0)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="w-14 h-14">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-slate-950 shadow-lg shadow-purple-500/50 hover:shadow-lg hover:shadow-purple-500/70 transition-shadow border border-cyan-300 glow"
        >
          <Settings size={24} className={`transition-transform ${isExpanded ? "rotate-45" : ""}`} />
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} className="hidden" />

      <ConfirmModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        description={modalState.description}
        confirmText={modalState.confirmText}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
        onCancel={closeModal}
      />
    </div>
  )
}
