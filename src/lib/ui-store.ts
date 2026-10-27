import { create } from "zustand"
import { persist } from "zustand/middleware"

/** UI preferences that survive navigation and reloads. Data never goes here. */
type UiState = {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    // Rehydrated after mount by the sidebar, so the server and first client render match.
    { name: "sparex-admin-ui", skipHydration: true },
  ),
)
