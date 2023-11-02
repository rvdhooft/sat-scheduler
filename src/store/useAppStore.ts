import { create } from 'zustand';
import { PersistStorage, devtools, persist } from 'zustand/middleware';
import {
  createDefaultPerformanceRoomsDay1,
  createDefaultPerformanceRoomsDay2,
} from '../utils/performanceRoomDefaults';
import { createAuralTestsSlice } from './auralTestsSlice';
import { createDaySlice } from './daySlice';
import { createPerformanceRoomsSlice } from './performanceRoomsSlice';
import { createStudentsSlice } from './studentsSlice';
import { AppState, Mutators } from './types';
import storageWithDateTimeReviver from './storageWithDateTimeReviver';
import { createParamsSlice, defaultParams } from './paramsSlice';
import { Student } from '../models';
import { createScheduleSlice } from './scheduleSlice';

export const useAppStore = create<AppState, Mutators>(
  devtools(
    persist(
      (set, ...rest) => ({
        ...createAuralTestsSlice(set, ...rest),
        ...createPerformanceRoomsSlice(set, ...rest),
        ...createStudentsSlice(set, ...rest),
        ...createDaySlice(set, ...rest),
        ...createParamsSlice(set, ...rest),
        ...createScheduleSlice(set, ...rest),
        clear: () =>
          set({
            ...defaultParams,
            students: [],
            auralTestsDay1: [],
            auralTestsDay2: [],
            performanceRoomsDay1: createDefaultPerformanceRoomsDay1(),
            performanceRoomsDay2: createDefaultPerformanceRoomsDay2(),
          }),
        generateTestStudents: () => {
          createStudentsSlice(set, ...rest).generateTestStudents();
          createAuralTestsSlice(set, ...rest).resetAuralTests();
          createPerformanceRoomsSlice(set, ...rest).resetPerformanceRooms();
        },
        importStudents: (students: Student[]) => {
          createStudentsSlice(set, ...rest).importStudents(students);
          createAuralTestsSlice(set, ...rest).resetAuralTests();
          createPerformanceRoomsSlice(set, ...rest).resetPerformanceRooms();
        },
        conflictCount: 0,
      }),
      {
        name: 'app-state',
        storage: storageWithDateTimeReviver as PersistStorage<AppState>,
      }
    )
  )
);
