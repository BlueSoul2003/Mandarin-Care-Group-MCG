import { create } from "zustand"

export interface Track {
  id: string
  title: string
  url: string
}

interface PlayerState {
  isPlaying: boolean
  currentTrack: Track | null
  playlist: Track[]
  playlistType: "all" | "favorites" | "custom"
  currentTime: number
  duration: number
  volume: number
  play: (track: Track, playlist?: Track[], playlistType?: "all" | "favorites") => void
  togglePlay: () => void
  setPlaylist: (tracks: Track[], type?: "all" | "favorites") => void
  nextTrack: () => void
  prevTrack: () => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  isPlaying: false,
  currentTrack: null,
  playlist: [],
  playlistType: "all",
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  play: (track, playlist, playlistType) => {
    set((state) => ({
      isPlaying: true,
      currentTrack: track,
      playlist: playlist && playlist.length > 0 ? playlist : state.playlist.length > 0 ? state.playlist : [track],
      playlistType: playlistType || state.playlistType,
    }))
  },
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setPlaylist: (tracks, type = "all") => set({ playlist: tracks, playlistType: type }),
  nextTrack: () => {
    const { playlist, currentTrack } = get()
    if (!playlist.length || !currentTrack) return
    const currentIndex = playlist.findIndex(
      (t) => t.id === currentTrack.id || t.url === currentTrack.url || t.title === currentTrack.title
    )
    const nextIndex = (currentIndex + 1) % playlist.length
    set({ currentTrack: playlist[nextIndex], isPlaying: true, currentTime: 0 })
  },
  prevTrack: () => {
    const { playlist, currentTrack, currentTime } = get()
    if (!playlist.length || !currentTrack) return
    if (currentTime > 3) {
      set({ currentTime: 0 })
      return
    }
    const currentIndex = playlist.findIndex(
      (t) => t.id === currentTrack.id || t.url === currentTrack.url || t.title === currentTrack.title
    )
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length
    set({ currentTrack: playlist[prevIndex], isPlaying: true, currentTime: 0 })
  },
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
}))
