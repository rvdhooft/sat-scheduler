import { AuralTest, PerformanceRoom, Student } from '../models';

const dateTimeReviver = function (key: string, value: string) {
  if (key.toLowerCase().includes('time')) {
    return new Date(value);
  }
  return value;
};

export function getStudents() {
  const data = localStorage.getItem('students');
  return data ? JSON.parse(data, dateTimeReviver) : null;
}

export function saveStudents(students: Student[]) {
  localStorage.setItem('students', JSON.stringify(students));
}

export function getPerformanceRooms() {
  const data = localStorage.getItem('performanceRooms');
  return data ? JSON.parse(data, dateTimeReviver) : null;
}

export function savePerformanceRooms(performanceRooms: PerformanceRoom[]) {
  localStorage.setItem('performanceRooms', JSON.stringify(performanceRooms));
}

export function getAuralTests() {
  const data = localStorage.getItem('auralTests');
  return data ? JSON.parse(data, dateTimeReviver) : null;
}

export function saveAuralTests(auralTests: AuralTest[]) {
  localStorage.setItem('auralTests', JSON.stringify(auralTests));
}
