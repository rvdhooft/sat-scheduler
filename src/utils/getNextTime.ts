import { addMinutes, isAfter, isBefore } from 'date-fns';
import { Level, SatPerformance, SchedulingRequest, Student } from '../models';
import getTimeAllowance from './getTimeAllowance';

function getNextTime(
  lastPerformance: SatPerformance,
  lastPerformanceStudent: Student,
  morningEndTime: Date,
  afternoonStartTime: Date,
  levels: Level[]
) {
  let nextTime = getNextAvailableTimeFromPerformance(
    lastPerformance,
    lastPerformanceStudent,
    levels
  );
  if (nextTime.getHours() === 10 && nextTime.getMinutes() < 15) {
    // 15 minute break
    nextTime = addMinutes(nextTime, 15);
  }
  if (
    isBefore(nextTime, afternoonStartTime) &&
    (isAfter(nextTime, morningEndTime) ||
      lastPerformanceStudent.request === SchedulingRequest.PM ||
      lastPerformanceStudent.request === SchedulingRequest.EarlyPM ||
      lastPerformanceStudent.request === SchedulingRequest.LatePM)
  ) {
    return afternoonStartTime;
  }
  return nextTime;
}

function getNextAvailableTimeFromPerformance(
  performance: SatPerformance,
  student: Student,
  levels: Level[]
) {
  const minutesForLevel = getTimeAllowance(student, levels);
  return addMinutes(performance.time, minutesForLevel || 0);
}

export default getNextTime;
