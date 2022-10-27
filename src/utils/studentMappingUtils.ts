import { SchedulingRequest, Student, StudentFileModel } from '../models';
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
    'Scheduling Requests': mapRequestToString(student.request),
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
    request: mapRequestFromFileModel(student['Scheduling Requests']),
    siblings: student['Siblings Testing on the Same Day'],
    performanceTime: student['Performance Time'],
    auralTestTime: student['Aural Test Time'],
  };
}

function mapRequestFromFileModel(request: string | undefined) {
  if (!request) return undefined;
  switch (request.toUpperCase()) {
    case 'AM':
      return SchedulingRequest.AM;
    case 'PM':
      return SchedulingRequest.PM;
    case 'EARLY AM':
      return SchedulingRequest.EarlyAM;
    case 'EARLY PM':
      return SchedulingRequest.EarlyPM;
    case 'LATE AM':
      return SchedulingRequest.LateAM;
    case 'LATE PM':
      return SchedulingRequest.LatePM;
    default:
      return undefined;
  }
}

export function mapRequestToString(request: SchedulingRequest | undefined) {
  switch (request) {
    case SchedulingRequest.AM:
      return 'AM';
    case SchedulingRequest.EarlyAM:
      return 'Early AM';
    case SchedulingRequest.EarlyPM:
      return 'Early PM';
    case SchedulingRequest.LateAM:
      return 'Late AM';
    case SchedulingRequest.LatePM:
      return 'Late PM';
    case SchedulingRequest.PM:
      return 'PM';
    default:
      return undefined;
  }
}
