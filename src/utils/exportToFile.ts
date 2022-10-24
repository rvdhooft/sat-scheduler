import { compareAsc } from 'date-fns';
import { utils, WorkBook, WorkSheet, writeFileXLSX } from 'xlsx';
import { AuralTest, PerformanceRoom, Student } from '../models';
import { mapToFileModel, mapToFileModels } from './studentMappingUtils';

const dateFormat = 'h:mm AM/PM';
const fileName = `SAT Schedule ${new Date().getFullYear()}.xlsx`;

function addStudentsToWb(wb: WorkBook, students: Student[]) {
  const fileModels = mapToFileModels(students, true);
  const ws1 = utils.json_to_sheet(fileModels, { dateNF: dateFormat });
  autofitColumns(fileModels, ws1);
  utils.book_append_sheet(wb, ws1, 'Students');
}

function addPerformanceRoomsToWb(wb: WorkBook, performanceRooms: PerformanceRoom[], day: number) {
  performanceRooms.forEach((room, i) => {
    const fileModels = room.performances
      .sort((a, b) => compareAsc(a.time, b.time))
      .map((x) => ({
        'Performance Time': x.time,
        ...mapToFileModel(x.student),
      }));
    const ws = utils.json_to_sheet(fileModels, { dateNF: dateFormat });
    autofitColumns(fileModels, ws);
    utils.book_append_sheet(wb, ws, `D${day + 1} P${i + 1}`);
  });
}

function addAuralTestsToWb(
  wb: WorkBook,
  auralTests: AuralTest[],
  auralRoomCount: number,
  day: number
) {
  const rowsByRoom: any[] = [];
  auralTests.forEach((test, i) => {
    if (!rowsByRoom[i % auralRoomCount]) rowsByRoom[i % auralRoomCount] = [];
    rowsByRoom[i % auralRoomCount].push({ Time: test.time, Level: test.level });
    test.students.forEach((student) => {
      rowsByRoom[i % auralRoomCount].push(mapToFileModel(student));
    });
  });
  rowsByRoom.forEach((room, i) => {
    const ws = utils.json_to_sheet(room, { dateNF: dateFormat });
    autofitColumns(room, ws, [
      'Test Time',
      'Level',
      'Student First Name',
      'Student Last Name',
      'SAT Level',
      'Scheduling Request',
      'Siblings Testing on the Same Day',
    ]);
    utils.book_append_sheet(wb, ws, `D${day + 1} A${i + 1}`);
  });
}

function autofitColumns(json: any[], worksheet: WorkSheet, header?: string[]) {
  const jsonKeys = header ? header : Object.keys(json.length > 1 ? json[1] : json[0]);

  const objectMaxLength: any[] = [];
  for (let i = 0; i < json.length; i++) {
    const value = json[i];
    for (let j = 0; j < jsonKeys.length; j++) {
      if (typeof value[jsonKeys[j]] == 'number') {
        objectMaxLength[j] = 10;
      } else {
        const l = value[jsonKeys[j]] ? value[jsonKeys[j]].length : 0;

        objectMaxLength[j] = objectMaxLength[j] >= l ? objectMaxLength[j] : l;
      }
    }

    const key = jsonKeys;
    for (let j = 0; j < key.length; j++) {
      objectMaxLength[j] = objectMaxLength[j] >= key[j].length ? objectMaxLength[j] : key[j].length;
    }
  }

  const wscols = objectMaxLength.map((w) => {
    return { width: w };
  });

  worksheet['!cols'] = wscols;
}

function exportToFile(
  students: Student[],
  performanceRoomsDay1: PerformanceRoom[],
  performanceRoomsDay2: PerformanceRoom[],
  auralTestsDay1: AuralTest[],
  auralTestsDay2: AuralTest[],
  auralRoomCount: number
) {
  const wb = utils.book_new();

  addStudentsToWb(
    wb,
    students.map((x, i) => ({ ...x, auralTestRoom: (i % auralRoomCount) + 1 }))
  );
  addPerformanceRoomsToWb(wb, performanceRoomsDay1, 0);
  addPerformanceRoomsToWb(wb, performanceRoomsDay2, 1);
  addAuralTestsToWb(wb, auralTestsDay1, auralRoomCount, 0);
  addAuralTestsToWb(wb, auralTestsDay2, auralRoomCount, 1);

  writeFileXLSX(wb, fileName);
}

export default exportToFile;
