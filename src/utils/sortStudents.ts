import { Student } from '../models';
import getSiblings from './getSiblings';

function computeSortScore(student: Student, students: Student[]) {
  const numSiblings = getSiblings(student, students).length;
  return student.siblings && student.request
    ? 6 + numSiblings + student.request
    : student.siblings
    ? 5 + numSiblings
    : student.request
    ? 1 + student.request
    : 0;
}

export default function sortStudents(students: Student[]) {
  return (a: Student, b: Student) => {
    const scoreb = computeSortScore(b, students);
    const scorea = computeSortScore(a, students);
    if (scorea > scoreb) return -1;
    if (scorea < scoreb) return 1;
    if (!a.siblings || !b.siblings) return 0;
    if (a.siblings > b.siblings) return -1;
    if (a.siblings < b.siblings) return 1;
    return 0;
  };
}
