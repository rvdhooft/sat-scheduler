import { Student } from '../models';

function getSiblings(student: Student, students: Student[]): Student[] {
  if (!student['Siblings Testing on the Same Day']) return [];
  const siblings = students.filter(
    (x) =>
      x['Siblings Testing on the Same Day'] === student['Siblings Testing on the Same Day'] &&
      !(
        x['Student First Name'] === student['Student First Name'] &&
        x['Student Last Name'] === student['Student Last Name']
      )
  );
  return siblings;
}

export default getSiblings;
