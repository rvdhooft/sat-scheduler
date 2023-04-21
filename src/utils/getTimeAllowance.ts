import { Level, Student } from '../models';

function getTimeAllowance(student: Student, levels: Level[]) {
  return levels.find((x) => x.name === student.level)?.timeAllowanceInMinutes;
}

export default getTimeAllowance;
