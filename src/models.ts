export interface Student {
  id: string;
  first: string;
  last: string;
  fullName: string;
  level: string;
  request?: string;
  siblings?: string;
  performanceTime?: Date;
  performanceRoom?: string;
  auralTestTime?: Date;
  auralTestRoom?: number;
}

export interface StudentFileModel {
  'Student First Name': string;
  'Student Last Name': string;
  'SAT Level': string;
  'Scheduling Requests'?: string;
  'Siblings Testing on the Same Day'?: string;
  'Performance Time'?: Date;
  'Performance Room'?: string;
  'Aural Test Time'?: Date;
  'Aural Test Room'?: string;
}

export interface PerformanceRoom {
  id: string;
  levels: string[];
  performances: SatPerformance[];
}

export interface SatPerformance {
  time: Date;
  student: Student;
}

export interface AuralTest {
  time: Date;
  students: Student[];
  level?: string;
}

export interface Level {
  name: string;
  timeAllowanceInMinutes: number;
}
