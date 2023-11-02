import { addMinutes, compareAsc, differenceInMinutes, isAfter, isBefore, addHours } from 'date-fns';
import { StateCreator } from 'zustand';
import { AuralTest, Level, PerformanceRoom, SchedulingRequest, Student } from '../models';
import assignRemainingAuralTests from '../utils/assignRemainingAuralTests';
import getLevelsForDay from '../utils/getLevelsForDay';
import getSiblings from '../utils/getSiblings';
import getTimeAllowance from '../utils/getTimeAllowance';
import reassignTimes from '../utils/reassignTimes';
import scheduleAuralTest from '../utils/scheduleAuralTest';
import { AppState, ScheduleSlice } from './types';
import sortStudents from '../utils/sortStudents';

export const createScheduleSlice: StateCreator<AppState, [], [], ScheduleSlice> = (set) => ({
  schedule: () =>
    set((state) => {
      const students = [...state.students].sort(sortStudents([...state.students]));
      const [performanceRoomsDay1, auralTestsDay1] = scheduleStudentsForDay(0, students, state);
      const [performanceRoomsDay2, auralTestsDay2] = scheduleStudentsForDay(1, students, state);
      const updates = {
        performanceRoomsDay1,
        performanceRoomsDay2,
        auralTestsDay1,
        auralTestsDay2,
        students,
      };
      return {
        ...updates,
        conflictCount: getConflictCount({ ...state, ...updates }),
      };
    }),
});

function getConflictCount(state: AppState): number {
  let sum = 0;
  state.students.forEach((s) => {
    if (hasIndividualTimeDiffError(s, state)) sum += 1;

    if (hasSiblingStartTimeDiffError(s, state)) sum += 1;

    if (hasPerformanceRequestError(s, state)) sum += 1;
  });
  return sum;
}

function hasPerformanceRequestError(student: Student, state: AppState) {
  if (
    student.request === SchedulingRequest.AM &&
    isAfter(student.performanceTime, state.morningEndTime)
  )
    return true;
  if (
    student.request === SchedulingRequest.EarlyAM &&
    isAfter(student.performanceTime, addHours(state.morningStartTime, 2))
  )
    return true;
  if (
    student.request === SchedulingRequest.LateAM &&
    (isBefore(student.performanceTime, addHours(state.morningEndTime, -2)) ||
      isAfter(student.performanceTime, state.morningEndTime))
  )
    return true;
  if (
    student.request === SchedulingRequest.PM &&
    isBefore(student.performanceTime, state.afternoonStartTime)
  )
    return true;
  if (
    student.request === SchedulingRequest.EarlyPM &&
    isAfter(student.performanceTime, addHours(state.afternoonStartTime, 2))
  )
    return true;
  if (
    student.request === SchedulingRequest.LatePM &&
    isBefore(student.performanceTime, addHours(state.afternoonEndTime, -2))
  )
    return true;

  return false;
}

function hasSiblingStartTimeDiffError(student: Student, state: AppState) {
  const diff = getSiblingStartDiffMax(student, state);
  return diff && diff > state.siblingStartMax;
}

function hasIndividualTimeDiffError(student: Student, state: AppState) {
  if (!student.auralTestTime || !student.performanceTime) return false;
  const timeDiff = Math.abs(differenceInMinutes(student.auralTestTime, student.performanceTime));

  // Time between aural & performance must be between min and max
  if (timeDiff < state.timeDifferenceMin || timeDiff > state.timeDifferenceMax) return true;
}

function getSiblingStartDiffMax(student: Student, state: AppState) {
  if (!student.siblings || !student.performanceTime || !student.auralTestTime) return null;

  const startTime = isBefore(student.auralTestTime, student.performanceTime)
    ? student.auralTestTime
    : student.performanceTime;
  const siblings = getSiblings(student, state.students);
  const siblingStartTimes = siblings
    .filter((sib) => sib.auralTestTime && sib.performanceTime)
    .map((sib) =>
      isBefore(sib.auralTestTime!, sib.performanceTime!) ? sib.auralTestTime : sib.performanceTime
    );
  if (!siblingStartTimes.length) return null;

  const allTimesSorted = [startTime, ...siblingStartTimes].sort((a, b) => compareAsc(a!, b!));
  return Math.abs(
    differenceInMinutes(allTimesSorted[0]!, allTimesSorted[allTimesSorted.length - 1]!)
  );
}

function createAuralTests(auralTestLevels: string[], state: AppState): AuralTest[] {
  let levelIndex = 0;
  const tests = [];
  let time = state.morningStartTime;

  while (isBefore(time, state.morningEndTime)) {
    // skip over 10 am so they get a ~15 min break
    if (!(time.getHours() == 10 && time.getMinutes() === 0)) {
      for (let i = 0; i < state.auralRoomCount; i++) {
        tests.push({ time, level: auralTestLevels[levelIndex], students: [] });
        levelIndex = (levelIndex + 1) % auralTestLevels.length;
      }
    }
    time = addMinutes(time, state.auralTimeAllowance);
  }
  time = state.afternoonStartTime;
  while (isBefore(time, state.afternoonEndTime)) {
    for (let i = 0; i < state.auralRoomCount; i++) {
      tests.push({ time, level: auralTestLevels[levelIndex], students: [] });
      levelIndex = (levelIndex + 1) % auralTestLevels.length;
    }
    time = addMinutes(time, state.auralTimeAllowance);
  }
  return tests;
}

function getNextAfternoonTime(room: PerformanceRoom, timeAllowance: number, forceAdd = false) {
  const nextTimeAfterPerformance = addMinutes(room.nextAfternoonTime!, timeAllowance);
  if (!forceAdd && isAfter(nextTimeAfterPerformance, room.latestAfternoonTime!)) return;

  const performanceTime = room.nextAfternoonTime;
  room.nextAfternoonTime = nextTimeAfterPerformance;
  return performanceTime;
}

function getPerformanceTime(
  room: PerformanceRoom,
  student: Student,
  levels: Level[],
  forceAdd = false
) {
  if (
    !room.latestAfternoonTime ||
    !room.latestMorningTime ||
    !room.nextMorningTime ||
    !room.nextAfternoonTime
  )
    return;

  const timeAllowance = getTimeAllowance(student, levels);
  if (!timeAllowance) return;

  if (student.request === SchedulingRequest.LateAM) {
    let performanceTime = addMinutes(room.latestMorningTime, -1 * timeAllowance);
    if (performanceTime.getHours() === 10 && performanceTime.getMinutes() < 15) {
      // 15 minute break
      performanceTime = addMinutes(performanceTime, -15);
    }
    if (isBefore(performanceTime, room.nextMorningTime)) {
      // if this would cause overlap, skip to afternoon
      return getNextAfternoonTime(room, timeAllowance, forceAdd);
    }

    room.latestMorningTime = performanceTime;
    return performanceTime;
  }
  if (student.request === SchedulingRequest.LatePM) {
    const performanceTime = addMinutes(room.latestAfternoonTime, -1 * timeAllowance);
    if (isBefore(performanceTime, room.nextAfternoonTime)) return; // don't cause overlap, so just bail out

    room.latestAfternoonTime = performanceTime;
    return performanceTime;
  }
  if (student.request === SchedulingRequest.EarlyPM || student.request === SchedulingRequest.PM) {
    return getNextAfternoonTime(room, timeAllowance, forceAdd);
  }

  // By default, schedule the next morning time
  let nextTimeAfterPerformance = addMinutes(room.nextMorningTime, timeAllowance);
  if (isAfter(nextTimeAfterPerformance, room.latestMorningTime)) {
    // if we're out of morning times, skip to afternoon
    return getNextAfternoonTime(room, timeAllowance, forceAdd);
  }
  const performanceTime = room.nextMorningTime;
  if (nextTimeAfterPerformance.getHours() === 10 && nextTimeAfterPerformance.getMinutes() < 15) {
    // 15 minute break
    nextTimeAfterPerformance = addMinutes(nextTimeAfterPerformance, 15);
  }
  room.nextMorningTime = nextTimeAfterPerformance;
  return performanceTime;
}

function scheduleStudentsForDay(
  day: number,
  students: Student[],
  state: AppState
): [PerformanceRoom[], AuralTest[]] {
  const perfRooms: PerformanceRoom[] = (
    day === 0 ? state.performanceRoomsDay1 : state.performanceRoomsDay2
  ).map((x) => ({
    ...x,
    performances: [],
    nextMorningTime: state.morningStartTime,
    latestMorningTime: x.morningEndTime,
    nextAfternoonTime: x.afternoonStartTime,
    latestAfternoonTime: state.afternoonEndTime,
  }));
  const levelsForDay = getLevelsForDay(day, state);
  const auralTests = createAuralTests(levelsForDay, state);

  for (const student of students.filter((x) => levelsForDay.includes(x.level))) {
    // Schedule Performance
    let roomForLevel = perfRooms.find((x) => x.levels[0] === student.level);
    if (!roomForLevel) roomForLevel = perfRooms.find((x) => x.levels.includes(student.level));
    if (!roomForLevel) continue;
    let performanceTime = getPerformanceTime(roomForLevel, student, state.levels);
    if (!performanceTime) {
      // If no time is found, try another room
      const additionalRoom = perfRooms.find(
        (x) => x.id !== roomForLevel?.id && x.levels.includes(student.level)
      );
      if (additionalRoom) {
        performanceTime = getPerformanceTime(additionalRoom, student, state.levels);
        if (performanceTime) {
          roomForLevel = additionalRoom;
        }
      }
      if (!performanceTime) {
        performanceTime = getPerformanceTime(roomForLevel, student, state.levels, true);
      }
    }
    if (!performanceTime) continue;
    roomForLevel.performances.push({ time: performanceTime, student: student.id });
    student.performanceTime = performanceTime;

    scheduleAuralTest(auralTests, student, state);
  }
  perfRooms.forEach((x) => {
    x.performances.sort((a, b) => compareAsc(a.time, b.time));
    reassignTimes(x, auralTests, students, state); // removes any gaps
  });

  assignRemainingAuralTests(students, auralTests, levelsForDay, state.timeDifferenceMin);

  return [perfRooms, auralTests];
}
