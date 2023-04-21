import { StateCreator } from 'zustand';
import { AuralTest, Student } from '../models';
import { AppState, AuralTestSlice } from './types';

export const createAuralTestsSlice: StateCreator<AppState, [], [], AuralTestSlice> = (
  set,
  get
) => ({
  auralTestsDay1: [],
  auralTestsDay2: [],
  getAuralTestsForDay: () => {
    const state = get();
    return state.day === 0 ? state.auralTestsDay1 : state.auralTestsDay2;
  },
  resetAuralTests: () => set(() => ({ auralTestsDay1: [], auralTestsDay2: [] })),
  updateAuralTests: (auralTests: AuralTest[]) => set(updateTests(auralTests)),
});

function updateTests(
  auralTests: AuralTest[]
): AppState | Partial<AppState> | ((state: AppState) => AppState | Partial<AppState>) {
  return (state) =>
    state.day === 0
      ? {
          auralTestsDay1: auralTests,
          students: updateStudentAuralTestTimes(auralTests, state.students),
        }
      : {
          auralTestsDay2: auralTests,
          students: updateStudentAuralTestTimes(auralTests, state.students),
        };
}

function updateStudentAuralTestTimes(auralTests: AuralTest[], students: Student[]) {
  return students.map((student) => {
    const test = auralTests.find((test) => test.students.some((x) => x === student.id));
    if (!test) return student;
    return {
      ...student,
      auralTestTime: test.time,
    };
  });
}
