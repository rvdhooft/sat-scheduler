import { addMinutes, compareAsc, differenceInMinutes, isAfter, isBefore } from 'date-fns';
import { StateCreator } from 'zustand';
import { AuralTest, Level, PerformanceRoom, SchedulingRequest, Student } from '../models';
import getLevelsForDay from '../utils/getLevelsForDay';
import getTimeAllowance from '../utils/getTimeAllowance';
import reassignTimes from '../utils/reassignTimes';
import scheduleAuralTest from '../utils/scheduleAuralTest';
import { AppState, ScheduleSlice } from './types';

export const createScheduleSlice: StateCreator<AppState, [], [], ScheduleSlice> = (set) => ({
  schedule: () =>
    set((state) => {
      const students = [...state.students];
      const [performanceRoomsDay1, auralTestsDay1] = scheduleStudentsForDay(0, students, state);
      const [performanceRoomsDay2, auralTestsDay2] = scheduleStudentsForDay(1, students, state);
      return {
        performanceRoomsDay1,
        performanceRoomsDay2,
        auralTestsDay1,
        auralTestsDay2,
        students,
      };
    }),
});

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

  // Go back through those without aural test times
  // Re-assign any unused aural test spots if that helps
  // Otherwise just give them whatever is closest
  for (const student of students.filter(
    (x) => !x.auralTestTime && levelsForDay.includes(x.level)
  )) {
    if (!student.performanceTime) continue;

    const auralsForLevelOrEmpty = auralTests.filter(
      (x) =>
        (x.level === student.level || !x.students.length) &&
        Math.abs(differenceInMinutes(x.time, student.performanceTime!)) >= state.timeDifferenceMin
    );
    auralsForLevelOrEmpty.sort(
      (a, b) =>
        Math.abs(differenceInMinutes(a.time, student.performanceTime!)) -
        Math.abs(differenceInMinutes(b.time, student.performanceTime!))
    );
    const closestAuralTest = auralsForLevelOrEmpty[0];
    if (!closestAuralTest) return;
    closestAuralTest.students.push(student.id);
    student.auralTestTime = closestAuralTest.time;
    closestAuralTest.level = student.level;
  }

  return [perfRooms, auralTests];
}
