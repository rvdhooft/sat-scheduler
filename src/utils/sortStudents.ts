import { Student } from '../models';
import getSiblings from './getSiblings';

function computeSortScore(student: Student, students: Student[]) {
  const numSiblings = getSiblings(student, students).length;
  return student['Siblings Testing on the Same Day'] && student['Scheduling Requests']
    ? 3 + numSiblings
    : student['Siblings Testing on the Same Day']
    ? 2 + numSiblings
    : student['Scheduling Requests']
    ? 1
    : 0;
}

export default function sortStudents(students: Student[]) {
  return (a: Student, b: Student) => {
    const scoreb = computeSortScore(b, students);
    const scorea = computeSortScore(a, students);
    if (scorea > scoreb) return -1;
    if (scorea < scoreb) return 1;
    if (!a['Siblings Testing on the Same Day'] || !b['Siblings Testing on the Same Day']) return 0;
    if (a['Siblings Testing on the Same Day'] > b['Siblings Testing on the Same Day']) return -1;
    if (a['Siblings Testing on the Same Day'] < b['Siblings Testing on the Same Day']) return 1;
    return 0;
  };
}
