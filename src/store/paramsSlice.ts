import { StateCreator } from 'zustand';
import { AppState, ParamsSlice } from './types';
import { Level } from '../models';

const MORNING_START_TIME = new Date('2023-01-01T08:45:00');
const MORNING_END_TIME = new Date('2023-01-01T12:00:00');
const AFTERNOON_START_TIME = new Date('2023-01-01T13:00:00');
const AFTERNOON_END_TIME = new Date('2023-01-01T16:00:00');

export const defaultParams = {
  auralRoomCount: 2,
  auralStudentLimit: 12,
  auralTimeAllowance: 15,
  levels: [
    { name: '1a', timeAllowanceInMinutes: 9 },
    { name: '1b', timeAllowanceInMinutes: 9 },
    { name: '2', timeAllowanceInMinutes: 9 },
    { name: '3', timeAllowanceInMinutes: 9 },
    { name: '4', timeAllowanceInMinutes: 10 },
    { name: '5', timeAllowanceInMinutes: 10 },
    { name: '6', timeAllowanceInMinutes: 11 },
    { name: '7', timeAllowanceInMinutes: 11 },
    { name: '8', timeAllowanceInMinutes: 14 },
    { name: '9', timeAllowanceInMinutes: 14 },
    { name: '10', timeAllowanceInMinutes: 17 },
    { name: '11', timeAllowanceInMinutes: 17 },
    { name: '12', timeAllowanceInMinutes: 17 },
  ],
  timeDifferenceMin: 20,
  timeDifferenceMax: 60,
  siblingStartMax: 20,
  morningStartTime: MORNING_START_TIME,
  morningEndTime: MORNING_END_TIME,
  afternoonStartTime: AFTERNOON_START_TIME,
  afternoonEndTime: AFTERNOON_END_TIME,
};

export const createParamsSlice: StateCreator<AppState, [], [], ParamsSlice> = (set) => ({
  ...defaultParams,
  setAuralRoomCount: (auralRoomCount: number) => set(() => ({ auralRoomCount })),
  setAuralStudentLimit: (auralStudentLimit: number) => set(() => ({ auralStudentLimit })),
  setAuralTimeAllowance: (auralTimeAllowance: number) => set(() => ({ auralTimeAllowance })),
  setLevels: (levels: Level[]) => set(() => ({ levels })),
  setTimeDifferenceMin: (timeDifferenceMin: number) => set(() => ({ timeDifferenceMin })),
  setTimeDifferenceMax: (timeDifferenceMax: number) => set(() => ({ timeDifferenceMax })),
  setSiblingStartMax: (siblingStartMax: number) => set(() => ({ siblingStartMax })),
  setMorningStartTime: (morningStartTime: Date) => set(() => ({ morningStartTime })),
  setMorningEndTime: (morningEndTime: Date) => set(() => ({ morningEndTime })),
  setAfternoonStartTime: (afternoonStartTime: Date) => set(() => ({ afternoonStartTime })),
  setAfternoonEndTime: (afternoonEndTime: Date) => set(() => ({ afternoonEndTime })),
});
