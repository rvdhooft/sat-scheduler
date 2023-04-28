import { differenceInMinutes } from 'date-fns';
import { AuralTest, Student } from '../models';

// Go back through those without aural test times
// Re-assign any unused aural test spots if that helps
// Otherwise just give them whatever is closest
export default function assignRemainingAuralTests(
  students: Student[],
  auralTests: AuralTest[],
  levelsForDay: string[],
  timeDifferenceMin: number
) {
  for (const student of students.filter(
    (x) => !x.auralTestTime && levelsForDay.includes(x.level)
  )) {
    if (!student.performanceTime) continue;

    const auralsForLevelOrEmpty = auralTests.filter(
      (x) =>
        (x.level === student.level || !x.students.length) &&
        Math.abs(differenceInMinutes(x.time, student.performanceTime!)) >= timeDifferenceMin
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
}
