import { create } from "zustand"

export type PrizeItem = {
  id: string
  name: string
  image: string
  used?: boolean
}

export type Player = {
  id: string
  name: string
  studentId?: string
  prize?: string
  rawData?: Record<string, any>
}

type PlayerStore = {
  players: Player[]
  winners: Player[]
  prizes: PrizeItem[]

  setPlayers: (players: Player[]) => void
  addPrize: (name: string, image: string) => void
  markPrizeUsed: (id: string) => void

  addWinner: (player: Player, prize: string) => void
  clearWinners: () => void

  updatePrize: (id: string, prize: string) => void
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  players: [],
  winners: [],
  prizes: [],

  setPlayers: (players) => set({ players }),

  addPrize: (name, image) =>
    set((state) => ({
      prizes: [...state.prizes, { id: Date.now().toString(), name, image, used: false }],
    })),

  markPrizeUsed: (id) =>
    set((state) => ({
      prizes: state.prizes.map((p) => (p.id === id ? { ...p, used: true } : p)),
    })),

  addWinner: (player, prize) =>
    set((state) => ({
      winners: [...state.winners, { ...player, prize }],
    })),

  clearWinners: () => set({ winners: [] }),

  updatePrize: (id, prize) =>
    set((state) => ({
      players: state.players.map((p) => (p.id === id ? { ...p, prize } : p)),
    })),
}))
