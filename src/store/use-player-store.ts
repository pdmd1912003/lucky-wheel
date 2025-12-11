import { create } from "zustand"

export interface Player {
  id: string
  name: string
  studentId: string
  rawData: Record<string, any>
  prize: string
}

export interface Prize {
  id: string
  name: string
  image: string
  quantity: number
  totalQuantity: number
}

export interface Winner {
  id: string
  name: string
  studentId: string
  rawData: Record<string, any>
  prize: string
}

interface PlayerStore {
  players: Player[]
  prizes: Prize[]
  winners: Winner[]

  setPlayers: (players: Player[]) => void
  addPlayer: (name: string, studentId?: string) => void
  removePlayer: (id: string) => void
  addPrize: (name: string, image: string, quantity: number) => void
  decreasePrizeQuantity: (id: string) => void
  addWinner: (player: Player, prizeName: string) => void
  clearWinners: () => void
  getRandomPrize: () => Prize | null
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  players: [],
  prizes: [],
  winners: [],

  setPlayers: (players) => set({ players }),

  addPlayer: (name, studentId) => {
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: studentId ? `${name} (${studentId})` : name,
      studentId: studentId || "",
      rawData: {},
      prize: "",
    }
    set((state) => ({
      players: [...state.players, newPlayer],
    }))
  },

  removePlayer: (id) => {
    set((state) => ({
      players: state.players.filter((p) => p.id !== id),
    }))
  },

  addPrize: (name, image, quantity) => {
    const newPrize: Prize = {
      id: Date.now().toString(),
      name,
      image,
      quantity,
      totalQuantity: quantity,
    }
    set((state) => ({
      prizes: [...state.prizes, newPrize],
    }))
  },

  decreasePrizeQuantity: (id) => {
    set((state) => ({
      prizes: state.prizes
        .map((p) => (p.id === id && p.quantity > 0 ? { ...p, quantity: p.quantity - 1 } : p))
        .filter((p) => p.quantity > 0 || p.id !== id),
    }))
  },

  addWinner: (player, prizeName) => {
    const newWinner: Winner = {
      ...player,
      prize: prizeName,
    }
    set((state) => ({
      winners: [...state.winners, newWinner],
    }))
  },

  clearWinners: () => set({ winners: [] }),

  getRandomPrize: () => {
    const { prizes } = get()
    const availablePrizes = prizes.filter((p) => p.quantity > 0)
    if (availablePrizes.length === 0) return null
    return availablePrizes[Math.floor(Math.random() * availablePrizes.length)]
  },
}))
