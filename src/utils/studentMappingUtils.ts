import { Student, StudentFileModel } from '../models';
import { v4 as uuidv4 } from 'uuid';

export function mapToFileModels(
  students: Student[],
  includeSchedule?: boolean
): StudentFileModel[] {
  return students.map((x) => mapToFileModel(x, includeSchedule));
}

export function mapToFileModel(student: Student, includeSchedule?: boolean): StudentFileModel {
  let res: StudentFileModel = {
    'Student First Name': student.first,
    'Student Last Name': student.last,
    'SAT Level': student.level,
    'Scheduling Requests': student.request,
    'Siblings Testing on the Same Day': student.siblings,
  };
  if (includeSchedule) {
    res = {
      ...res,
      'Performance Time': student.performanceTime,
      'Performance Room': `Performance Room ${student.performanceRoom}`,
      'Aural Test Time': student.auralTestTime,
      'Aural Test Room': `Aural Test Room ${student.auralTestRoom}`,
    };
  }
  return res;
}

export function mapFromFileModels(students: StudentFileModel[]): Student[] {
  return students.map((x) => mapFromFileModel(x));
}

export function mapFromFileModel(student: StudentFileModel): Student {
  return {
    id: uuidv4(),
    first: student['Student First Name'],
    last: student['Student Last Name'],
    fullName: `${student['Student First Name']} ${student['Student Last Name']}`,
    level: student['SAT Level'].toString(),
    request: student['Scheduling Requests'],
    siblings: student['Siblings Testing on the Same Day'],
    performanceTime: student['Performance Time'],
    auralTestTime: student['Aural Test Time'],
  };
}
