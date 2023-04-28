import { differenceInMinutes, isEqual } from 'date-fns';
import isTimeDifferenceInRange from './isTimeDifferenceInRange';
import { AuralTest, Student } from '../models';
import { AppState } from '../store/types';

function scheduleAuralTest(auralTests: AuralTest[], student: Student, state: AppState) {
  clearExistingAuralTest(auralTests, student);
  const auralsInTimeRange = auralTests.filter((x) =>
    isTimeDifferenceInRange(
      student.performanceTime,
      x.time,
      state.timeDifferenceMin,
      state.timeDifferenceMax
    )
  );
  const matches = auralsInTimeRange
    .filter((x) => x.level === student.level && x.students.length <= state.auralStudentLimit)
    .sort(
      (a, b) =>
        Math.abs(differenceInMinutes(a.time, student.performanceTime!)) -
        Math.abs(differenceInMinutes(b.time, student.performanceTime!))
    );
  if (matches.length) {
    matches[0].students.push(student.id);
    student.auralTestTime = matches[0].time;
  } else {
    student.auralTestTime = null;
  }
}

function clearExistingAuralTest(auralTests: AuralTest[], student: Student) {
  if (!student.auralTestTime) return;

  const auralTestsForTime = auralTests.filter((x) => isEqual(x.time, student.auralTestTime!));
  auralTestsForTime.forEach(
    (auralTest: AuralTest) =>
      (auralTest.students = auralTest.students.filter((x) => x !== student.id))
  );
}

export default scheduleAuralTest;
