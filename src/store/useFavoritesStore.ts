import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { normalizeTrack, restoreFavorites, sameTrack } from "../lib/track-identity"

export interface FavoriteTrack {
  id: string
  title: string
  url: string
}

interface FavoritesState {
  favorites: FavoriteTrack[]
  toggleFavorite: (track: FavoriteTrack) => void
  isFavorite: (track: Pick<FavoriteTrack, "url">) => boolean
  clearFavorites: () => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (track: FavoriteTrack) => {
        const { favorites } = get()
        const exists = favorites.some(
          (f) => sameTrack(f, track)
        )
        if (exists) {
          set({
            favorites: favorites.filter(
              (f) => !sameTrack(f, track)
            ),
          })
        } else {
          set({
            favorites: [...favorites, normalizeTrack(track)],
          })
        }
      },
      isFavorite: (track) => {
        const { favorites } = get()
        return favorites.some(
          (f) => sameTrack(f, track)
        )
      },
      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: "mcg_favorite_songs",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persisted) => ({ favorites: restoreFavorites(persisted) }),
      merge: (persisted, current) => ({ ...current, favorites: restoreFavorites(persisted) }),
      partialize: (state) => ({ favorites: state.favorites }),
    }
  )
)
