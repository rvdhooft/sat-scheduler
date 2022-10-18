import { Student } from '../models';

function getSiblings(student: Student, students: Student[]): Student[] {
  if (!student.siblings) return [];
  return students.filter((x) => x.siblings === student.siblings && x.id !== student.id);
}

export default getSiblings;
