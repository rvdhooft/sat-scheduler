export interface Student {
  'Student First Name': string;
  'Student Last Name': string;
  'SAT Level': string;
  'Scheduling Requests'?: string;
  'Siblings Testing on the Same Day'?: string;
  performanceTime?: Date;
  auralTestTime?: Date;
}

export interface PerformanceRoom {
  level: string;
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
