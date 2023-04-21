import { StateCreator } from 'zustand';
import { AppState, DaySlice } from './types';

export const createDaySlice: StateCreator<AppState, [], [], DaySlice> = (set) => ({
  day: 0,
  setDay: (day: number) => set(() => ({ day })),
});
