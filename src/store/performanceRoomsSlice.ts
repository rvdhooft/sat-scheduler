import { StateCreator } from 'zustand';
import { PerformanceRoom } from '../models';
import {
  createDefaultPerformanceRoomsDay1,
  createDefaultPerformanceRoomsDay2,
} from '../utils/performanceRoomDefaults';
import reassignTimes from '../utils/reassignTimes';
import { AppState, PerformanceRoomSlice } from './types';

export const createPerformanceRoomsSlice: StateCreator<AppState, [], [], PerformanceRoomSlice> = (
  set,
  get
) => ({
  performanceRoomsDay1: createDefaultPerformanceRoomsDay1(),
  performanceRoomsDay2: createDefaultPerformanceRoomsDay2(),
  setPerformanceRooms: (performanceRooms: PerformanceRoom[]) =>
    set((state) =>
      state.day === 0
        ? { performanceRoomsDay1: performanceRooms }
        : { performanceRoomsDay2: performanceRooms }
    ),
  getPerformanceRoomsForDay: () => {
    const state = get();
    return state.day === 0 ? state.performanceRoomsDay1 : state.performanceRoomsDay2;
  },
  resetPerformanceRooms: () =>
    set((state) => ({
      performanceRoomsDay1: state.performanceRoomsDay1.map((x) => ({
        ...x,
        performances: [],
      })),
      performanceRoomsDay2: state.performanceRoomsDay2.map((x) => ({
        ...x,
        performances: [],
      })),
    })),
  updatePerformances: (performanceRoom: PerformanceRoom) =>
    set(updatePerformances(performanceRoom)),
});

const updatePerformances = (room: PerformanceRoom) => {
  return (state) => {
    const auralTests = [...state.getAuralTestsForDay()];
    const students = [...state.students];
    reassignTimes(room, auralTests, students, state);
    return state.day === 0
      ? {
          auralTestsDay1: auralTests,
          performanceRoomsDay1: state.performanceRoomsDay1.map((x) =>
            x.id === room.id ? room : x
          ),
          students,
        }
      : {
          auralTestsDay2: auralTests,
          performanceRoomsDay2: state.performanceRoomsDay2.map((x) =>
            x.id === room.id ? room : x
          ),
          students,
        };
  };
};
