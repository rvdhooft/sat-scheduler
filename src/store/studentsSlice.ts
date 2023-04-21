import { StateCreator } from 'zustand';
import { Student } from '../models';
import { AppState, StudentSlice } from './types';
import generateTestData from '../utils/generateTestData';
import sortStudents from '../utils/sortStudents';
import getLevelsForDay from '../utils/getLevelsForDay';

export const createStudentsSlice: StateCreator<AppState, [], [], StudentSlice> = (set, get) => ({
  students: [],
  getStudentsForDay: () => getStudentsForDay(get()),
  setStudents: (students: Student[]) => set(() => ({ students })),
  generateTestStudents: () => set(() => ({ students: generateTestData() })),
  importStudents: (students: Student[]) =>
    set(() => ({ students: students.sort(sortStudents(students)) })),
});

function getStudentsForDay(state: AppState) {
  const levels = getLevelsForDay(state.day, state);
  return state.students.filter((x) => levels.includes(x.level));
}
