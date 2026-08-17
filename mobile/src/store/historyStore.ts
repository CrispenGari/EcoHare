import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORAGE_NAME } from "../constants";
import { zustandStorage } from "./storage";
import { TIrrigationFeatures, TIrrigationPrediction } from "../types";

export type THistory = TIrrigationPrediction & {
  id: string;
  date: Date;
  features: TIrrigationFeatures;
};
interface THistoryState {
  history: THistory[];
  add: (history: THistory) => void;
  update: (history: THistory) => void;
  remove: (id: string) => void;
  clear: () => void;
  find: (id: string) => THistory | undefined;
}

export const useHistoryStore = create<THistoryState>()(
  persist(
    (set, _get) => ({
      history: [],
      add: (hist) => set({ ..._get(), history: [hist, ..._get().history] }),
      update: (hist) =>
        set({
          ..._get(),
          history: _get().history.map((h) => (h.id === hist.id ? hist : h)),
        }),
      clear: () => set({ ..._get(), history: [] }),
      remove: (id) => {
        return set({
          ..._get(),
          history: _get().history.filter((h) => h.id !== id),
        });
      },
      find: (id) => {
        return _get().history.find((h) => h.id === id);
      },
    }),
    {
      name: STORAGE_NAME.HISTORY,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
