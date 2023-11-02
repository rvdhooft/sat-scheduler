import { AuralTest, Level, PerformanceRoom, Student } from '../models';

export interface AuralTestSlice {
  auralTestsDay1: AuralTest[];
  auralTestsDay2: AuralTest[];
  getAuralTestsForDay: () => AuralTest[];
  resetAuralTests: () => void;
  updateAuralTests: (auralTests: AuralTest[]) => void;
}

export interface PerformanceRoomSlice {
  performanceRoomsDay1: PerformanceRoom[];
  performanceRoomsDay2: PerformanceRoom[];
  getPerformanceRoomsForDay: () => PerformanceRoom[];
  setPerformanceRooms: (performanceRooms: PerformanceRoom[]) => void;
  resetPerformanceRooms: () => void;
  updatePerformances: (performanceRoom: PerformanceRoom) => void;
}

export interface StudentSlice {
  students: Student[];
  getStudentsForDay: () => Student[];
  setStudents: (students: Student[]) => void;
  generateTestStudents: () => void;
  importStudents: (students: Student[]) => void;
}

export interface DaySlice {
  day: number;
  setDay: (day: number) => void;
}

export interface ParamsSlice {
  auralRoomCount: number;
  setAuralRoomCount: (count: number) => void;
  auralStudentLimit: number;
  setAuralStudentLimit: (count: number) => void;
  auralTimeAllowance: number;
  setAuralTimeAllowance: (count: number) => void;
  levels: Level[];
  setLevels: (levels: Level[]) => void;
  timeDifferenceMin: number;
  setTimeDifferenceMin: (count: number) => void;
  timeDifferenceMax: number;
  setTimeDifferenceMax: (count: number) => void;
  siblingStartMax: number;
  setSiblingStartMax: (count: number) => void;
  morningStartTime: Date;
  setMorningStartTime: (date: Date) => void;
  morningEndTime: Date;
  setMorningEndTime: (date: Date) => void;
  afternoonStartTime: Date;
  setAfternoonStartTime: (date: Date) => void;
  afternoonEndTime: Date;
  setAfternoonEndTime: (date: Date) => void;
}

export interface ScheduleSlice {
  schedule: () => void;
}

export type AppState = AuralTestSlice &
  PerformanceRoomSlice &
  StudentSlice &
  DaySlice &
  ParamsSlice &
  ScheduleSlice & {
    clear: () => void;
    generateTestStudents: () => void;
    importStudents: (students: Student[]) => void;
    conflictCount: number;
  };

export type Mutators = [['zustand/devtools', never], ['zustand/persist', AppState]];
