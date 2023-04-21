export interface Student {
  id: string;
  first: string;
  last: string;
  fullName: string;
  level: string;
  request?: SchedulingRequest;
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
  morningEndTime: Date;
  afternoonStartTime: Date;

  // Scheduling helpers
  nextMorningTime?: Date;
  latestMorningTime?: Date;
  nextAfternoonTime?: Date;
  latestAfternoonTime?: Date;
}

export interface SatPerformance {
  time: Date;
  student: string;
}

export interface AuralTest {
  time: Date;
  students: string[];
  level?: string;
}

export interface Level {
  name: string;
  timeAllowanceInMinutes: number;
}

export enum SchedulingRequest {
  AM = 1,
  PM = 2,
  LatePM = 3,
  LateAM = 4,
  EarlyPM = 5,
  EarlyAM = 6,
}
