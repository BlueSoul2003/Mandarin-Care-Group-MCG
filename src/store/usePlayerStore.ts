import { create } from "zustand"

interface Track {
  id: string
  title: string
  url: string
}

interface PlayerState {
  isPlaying: boolean
  currentTrack: Track | null
  volume: number
  play: (track: Track) => void
  togglePlay: () => void
  setVolume: (volume: number) => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  isPlaying: false,
  currentTrack: null,
  volume: 0.8,
  play: (track) => set({ isPlaying: true, currentTrack: track }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setVolume: (volume) => set({ volume }),
}))
