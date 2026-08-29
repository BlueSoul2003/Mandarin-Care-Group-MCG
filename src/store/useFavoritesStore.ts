import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface FavoriteTrack {
  id: string
  title: string
  url: string
}

interface FavoritesState {
  favorites: FavoriteTrack[]
  toggleFavorite: (track: FavoriteTrack) => void
  isFavorite: (trackUrlOrId: string) => boolean
  clearFavorites: () => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (track: FavoriteTrack) => {
        const { favorites } = get()
        const exists = favorites.some(
          (f) => f.id === track.id || f.url === track.url || f.title === track.title
        )
        if (exists) {
          set({
            favorites: favorites.filter(
              (f) => f.id !== track.id && f.url !== track.url && f.title !== track.title
            ),
          })
        } else {
          set({
            favorites: [...favorites, track],
          })
        }
      },
      isFavorite: (trackUrlOrId: string) => {
        const { favorites } = get()
        return favorites.some(
          (f) => f.id === trackUrlOrId || f.url === trackUrlOrId || f.title === trackUrlOrId
        )
      },
      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: "mcg_favorite_songs",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
