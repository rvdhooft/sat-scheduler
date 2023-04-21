import { AuralTest, PerformanceRoom, Student } from '../models';
import { AppState } from '../store/types';
import getNextTime from './getNextTime';
import isTimeDifferenceInRange from './isTimeDifferenceInRange';
import scheduleAuralTest from './scheduleAuralTest';

function reassignTimes(
  room: PerformanceRoom,
  auralTests: AuralTest[],
  students: Student[],
  state: AppState
) {
  for (let i = 0; i < room.performances.length; i++) {
    const student = students.find((x) => x.id === room.performances[i].student);
    if (!student) continue;
    let nextTime;
    if (i == 0) {
      nextTime = state.morningStartTime;
    } else {
      nextTime = getNextTime(
        room.performances[i - 1],
        student,
        room.morningEndTime,
        room.afternoonStartTime,
        state.levels
      );
      room.performances[i].time = nextTime;
    }
    room.performances[i].time = nextTime;

    student.performanceTime = nextTime;
    if (
      !student.auralTestTime ||
      // if aural test needs to change
      !isTimeDifferenceInRange(
        student.performanceTime,
        student.auralTestTime,
        state.timeDifferenceMin,
        state.timeDifferenceMax
      )
    ) {
      scheduleAuralTest(auralTests, student, state);
    }
  }
}

export default reassignTimes;
