import { create } from 'zustand';

interface AppState {
  isAuthenticated: boolean;
  userId: string | null;
  userFirstName: string | null;
  userLastName: string | null;
  setAuthenticated: (
    isAuth: boolean,
    userId: string | null,
    userFirstName?: string | null,
    userLastName?: string | null
  ) => void;
  pendingDoses: string[];
  setPendingDoses: (doses: string[]) => void;
  addPendingDose: (doseId: string) => void;
  removePendingDose: (doseId: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  userId: null,
  userFirstName: null,
  userLastName: null,
  pendingDoses: [],
  setAuthenticated: (isAuth, userId, userFirstName = null, userLastName = null) =>
    set({ isAuthenticated: isAuth, userId, userFirstName, userLastName }),
  setPendingDoses: (doses) => set({ pendingDoses: doses }),
  addPendingDose: (doseId) => set((state) => ({
    pendingDoses: [...state.pendingDoses, doseId]
  })),
  removePendingDose: (doseId) => set((state) => ({
    pendingDoses: state.pendingDoses.filter(id => id !== doseId)
  })),
}));
