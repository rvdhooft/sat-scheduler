import { deepEqual } from 'fast-equals';
import { TemporalState, temporal } from 'zundo';
import { create } from 'zustand';
import { PersistStorage, devtools, persist } from 'zustand/middleware';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { Student } from '../models';
import {
  createDefaultPerformanceRoomsDay1,
  createDefaultPerformanceRoomsDay2,
} from '../utils/performanceRoomDefaults';
import { createAuralTestsSlice } from './auralTestsSlice';
import { createDaySlice } from './daySlice';
import { createParamsSlice, defaultParams } from './paramsSlice';
import { createPerformanceRoomsSlice } from './performanceRoomsSlice';
import { createScheduleSlice } from './scheduleSlice';
import storageWithDateTimeReviver from './storageWithDateTimeReviver';
import { createStudentsSlice } from './studentsSlice';
import { AppState } from './types';

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      temporal(
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
        }),
        {
          partialize: (state) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { day, ...rest } = state; // ignore day change
            return rest;
          },
          equality: deepEqual,
        }
      ),
      {
        name: 'app-state',
        storage: storageWithDateTimeReviver as PersistStorage<AppState>,
      }
    )
  )
);

export const useTemporalStore = <T>(
  selector: (state: TemporalState<AppState>) => T,
  equality?: (a: T, b: T) => boolean
) => useStoreWithEqualityFn(useAppStore.temporal, selector, equality);
