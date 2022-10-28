import { AuralTest, PerformanceRoom, Student } from '../models';

const dateTimeReviver = function (key: string, value: string) {
  if (key.toLowerCase().includes('time')) {
    return new Date(value);
  }
  return value;
};

function getFromJsonByKey(key: string) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data, dateTimeReviver) : null;
}

function saveByKey(key: string, data: any) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getStudents() {
  return getFromJsonByKey('students');
}

export function saveStudents(students: Student[]) {
  saveByKey('students', students);
}

export function getPerformanceRoomsDay1() {
  return getFromJsonByKey('performanceRoomsDay1');
}

export function getPerformanceRoomsDay2() {
  return getFromJsonByKey('performanceRoomsDay2');
}

export function savePerformanceRoomsDay1(performanceRooms: PerformanceRoom[]) {
  return saveByKey('performanceRoomsDay1', performanceRooms);
}

export function savePerformanceRoomsDay2(performanceRooms: PerformanceRoom[]) {
  return saveByKey('performanceRoomsDay2', performanceRooms);
}

export function getAuralTestsDay1() {
  return getFromJsonByKey('auralTestsDay1');
}

export function getAuralTestsDay2() {
  return getFromJsonByKey('auralTestsDay2');
}

export function saveAuralTestsDay1(auralTests: AuralTest[]) {
  return saveByKey('auralTestsDay1', auralTests);
}

export function saveAuralTestsDay2(auralTests: AuralTest[]) {
  return saveByKey('auralTestsDay2', auralTests);
}

const paramsDateTimeReviver = function (key: string, value: string) {
  if (key.toLowerCase().includes('starttime') || key.toLowerCase().includes('endtime')) {
    return new Date(value);
  }
  return value;
};

export function getParams() {
  const data = localStorage.getItem('params');
  return data ? JSON.parse(data, paramsDateTimeReviver) : null;
}

export function saveParams(params: any) {
  return saveByKey('params', params);
}
