import { utils, writeFileXLSX } from 'xlsx';
import { AuralTest, PerformanceRoom, Student } from '../models';

function exportToFile(
  students: Student[],
  performanceRooms: PerformanceRoom[],
  auralTests: AuralTest[],
  auralRoomCount: number
) {
  const dateFormat = 'h:mm AM/PM';
  const fileName = `SAT Schedule ${new Date().getFullYear()}.xlsx`;
  const wb = utils.book_new();
  const ws1 = utils.json_to_sheet(students, { dateNF: dateFormat });
  utils.book_append_sheet(wb, ws1, 'Students');
  performanceRooms.forEach((room, i) => {
    const ws = utils.json_to_sheet(
      room.performances.map((x) => ({ Time: x.time, ...x.student })),
      { dateNF: dateFormat }
    );
    utils.book_append_sheet(wb, ws, `P ${i + 1}`);
  });

  const rowsByRoom: any[] = [];
  auralTests.forEach((test, i) => {
    if (!rowsByRoom[i % auralRoomCount]) rowsByRoom[i % auralRoomCount] = [];
    rowsByRoom[i % auralRoomCount].push({ Time: test.time, Level: test.level });
    test.students.forEach((student) => {
      rowsByRoom[i % auralRoomCount].push(student);
    });
  });
  rowsByRoom.forEach((room, i) => {
    const ws3 = utils.json_to_sheet(room, { dateNF: dateFormat });
    utils.book_append_sheet(wb, ws3, `A ${i + 1}`);
  });
  writeFileXLSX(wb, fileName);
}

export default exportToFile;
