import { ThemeProvider } from '@emotion/react';
import { theme } from './theme';
import { AppBar, Box, Button, Container, CssBaseline, Toolbar, Typography } from '@mui/material';
import FileUpload from './components/FileUpload';
import { useState } from 'react';
import studentTestData from './students';
import { AuralTest, PerformanceRoom, SatPerformance, Student } from './models';
import { compareAsc, addMinutes, isBefore, differenceInMinutes, isAfter } from 'date-fns';
import OptionFormFields from './components/OptionFormFields';
import Students from './components/Students';
import getSiblings from './utils/getSiblings';
import Performances from './components/Performances';
import AuralTests from './components/AuralTests';

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

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTestData() {
  const testStudents: Student[] = [];
  let siblings = undefined;
  let siblingRequest = undefined;
  let siblingCount = 0;
  const total = 200;
  for (let i = 0; i < total; i++) {
    const randomRequest = getRandomInt(1, 5);
    const randomLevel = getRandomInt(0, 5);
    if (siblingCount == 0) {
      siblings = undefined;
      siblingRequest = undefined;
    }
    if (siblingCount > 0) {
      siblingCount--;
    } else if (i < total - 2) {
      const randomSiblings = getRandomInt(0, 7);
      if (randomSiblings === 5) {
        siblingCount = getRandomInt(1, 2);
        siblings = `Siblings ${i}`;
        siblingRequest = randomRequest;
      }
    }

    testStudents.push({
      'Student Last Name': 'Student ' + i,
      'Student First Name': 'Test',
      'SAT Level': randomLevel === 0 ? '1a' : randomLevel === 1 ? '1b' : randomLevel.toString(),
      'Scheduling Requests':
        (siblingRequest || randomRequest) === 1
          ? 'AM'
          : (siblingRequest || randomRequest) === 2
          ? 'PM'
          : undefined,
      'Siblings Testing on the Same Day': siblings,
    });
  }
  testStudents.sort((a: Student, b: Student) => {
    const scoreb = computeSortScore(b, testStudents);
    const scorea = computeSortScore(a, testStudents);
    if (scorea > scoreb) return -1;
    if (scorea < scoreb) return 1;
    if (!a['Siblings Testing on the Same Day'] || !b['Siblings Testing on the Same Day']) return 0;
    if (a['Siblings Testing on the Same Day'] > b['Siblings Testing on the Same Day']) return -1;
    if (a['Siblings Testing on the Same Day'] < b['Siblings Testing on the Same Day']) return 1;
    return 0;
  });
  return testStudents;
}

function App() {
  studentTestData.sort(
    (a: Student, b: Student) =>
      computeSortScore(b, studentTestData) - computeSortScore(a, studentTestData)
  );
  const testData = generateTestData();
  const [students, setStudents] = useState<Student[]>(testData);
  const [performanceRoomCount, setPerformanceRoomCount] = useState(6);
  const [auralRoomCount, setAuralRoomCount] = useState(2);
  const [auralStudentLimit, setAuralStudentLimit] = useState(12);
  const [auralTimeAllowance, setAuralTimeAllowance] = useState(15);
  const [performanceTimeAllowance, setPerformanceTimeAllowance] = useState({
    '1a': 9,
    '1b': 9,
    '2': 9,
    '3': 9,
    '4': 10,
    '5': 10,
    '6': 11,
    '7': 11,
    '8': 14,
    '9': 14,
    '10': 17,
    '11': 17,
    '12': 17,
  });
  const [timeDifferenceMin, setTimeDifferenceMin] = useState(20);
  const [timeDifferenceMax, setTimeDifferenceMax] = useState(60);
  const [siblingStartMax, setSiblingStartMax] = useState(20);
  const [morningStartTime, setMorningStartTime] = useState(new Date('2023-01-01T08:30:00'));
  const [morningEndTime, setMorningEndTime] = useState(new Date('2023-01-01T12:00:00'));
  const [afternoonStartTime, setAfternoonStartTime] = useState(new Date('2023-01-01T13:00:00'));
  const afternoonEndTime = new Date('2023-01-01T16:00:00');

  const [performanceRooms, setPerformanceRooms] = useState<PerformanceRoom[]>([]);
  const [auralTests, setAuralTests] = useState<AuralTest[]>([]);

  function createPerformanceRooms() {
    // todo: find distribution of levels

    const rooms: PerformanceRoom[] = [
      { level: '1a', performances: [] },
      { level: '1b', performances: [] },
      { level: '2', performances: [] },
      { level: '3', performances: [] },
      { level: '4', performances: [] },
      { level: '5', performances: [] },
    ];
    return rooms;
  }

  function createAuralTests(): AuralTest[] {
    const tests = [];
    let time = morningStartTime;
    while (isBefore(time, morningEndTime)) {
      // skip over 10 am so they get a ~15 min break
      if (!(time.getHours() == 10 && time.getMinutes() === 0)) {
        for (let i = 0; i < auralRoomCount; i++) {
          tests.push({ time, students: [] });
        }
      }
      time = addMinutes(time, auralTimeAllowance);
    }
    time = afternoonStartTime;
    while (isBefore(time, afternoonEndTime)) {
      for (let i = 0; i < auralRoomCount; i++) {
        tests.push({ time, students: [] });
      }
      time = addMinutes(time, auralTimeAllowance);
    }
    return tests;
  }

  function getNextAvailableTimeFromPerformance(performance: SatPerformance) {
    return addMinutes(
      performance.time,
      performanceTimeAllowance[
        performance.student['SAT Level'] as keyof typeof performanceTimeAllowance
      ]
    );
  }

  function getNextMorningTime(room: PerformanceRoom) {
    const performances = room?.performances
      .filter((x) => x.time < morningEndTime)
      .sort((a, b) => compareAsc(b.time, a.time));
    if (!performances?.length) return morningStartTime;
    return getNextAvailableTimeFromPerformance(performances[0]);
  }

  function getNextAfternoonTime(room: PerformanceRoom) {
    const performances = room?.performances
      .filter((x) => x.time >= afternoonStartTime)
      .sort((a, b) => compareAsc(b.time, a.time));
    if (!performances?.length) return afternoonStartTime;
    return getNextAvailableTimeFromPerformance(performances[0]);
  }

  function getNextAvailableTime(room: PerformanceRoom, request?: string) {
    if (request === 'PM') {
      return getNextAfternoonTime(room);
    }
    let nextTime = getNextMorningTime(room);
    if (nextTime.getHours() === 10 && nextTime.getMinutes() < 15) {
      // 15 minute break
      nextTime = addMinutes(nextTime, 15);
    }
    if (isAfter(nextTime, morningEndTime)) {
      return getNextAfternoonTime(room);
    }
    return nextTime;
  }

  function scheduleStudents() {
    const perfRooms = createPerformanceRooms();
    const auralTests = createAuralTests();

    // Schedule performances
    for (const student of students) {
      // Schedule Performance
      const roomForLevel = perfRooms.find((x) => x.level === student['SAT Level']);
      if (!roomForLevel) continue;
      const nextAvailableTime = getNextAvailableTime(roomForLevel, student['Scheduling Requests']);
      roomForLevel.performances.push({ time: nextAvailableTime, student });
      student.performanceTime = nextAvailableTime;
    }

    // Schedule aural tests
    for (const student of [...students].sort((a, b) =>
      !a.performanceTime || !b.performanceTime
        ? 0
        : compareAsc(a.performanceTime, b.performanceTime)
    )) {
      if (!student.performanceTime) continue;
      const auralsInTimeRange = auralTests.filter((x) => {
        const difference = Math.abs(differenceInMinutes(student.performanceTime as Date, x.time));
        return difference >= timeDifferenceMin && difference <= timeDifferenceMax;
      });
      const match = auralsInTimeRange.find(
        (x) => x.level === student['SAT Level'] && x.students.length <= auralStudentLimit
      );
      if (match) {
        match.students.push(student);
        student.auralTestTime = match.time;
      } else {
        const unassignedAural = auralsInTimeRange.find((x) => !x.level);
        if (!unassignedAural) {
          continue;
        }
        unassignedAural.level = student['SAT Level'];
        unassignedAural.students.push(student);
        student.auralTestTime = unassignedAural.time;
      }
    }

    setPerformanceRooms(perfRooms);
    setAuralTests(auralTests);
  }

  const handleStudentsChange = (students: Student[]) => {
    students.sort(
      (a: Student, b: Student) => computeSortScore(b, students) - computeSortScore(a, students)
    );
    setStudents(students);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <main>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="h1">
              SAT Scheduler
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth={false} sx={{ px: 10, py: 5 }}>
          <Box display="flex">
            <OptionFormFields
              performanceRoomCount={performanceRoomCount}
              setPerformanceRoomCount={setPerformanceRoomCount}
              auralRoomCount={auralRoomCount}
              setAuralRoomCount={setAuralRoomCount}
              auralTimeAllowance={auralTimeAllowance}
              setAuralTimeAllowance={setAuralTimeAllowance}
              performanceTimeAllowance={performanceTimeAllowance}
              setPerformanceTimeAllowance={setPerformanceTimeAllowance}
              auralStudentLimit={auralStudentLimit}
              setAuralStudentLimit={setAuralStudentLimit}
              timeDifferenceMin={timeDifferenceMin}
              setTimeDifferenceMin={setTimeDifferenceMin}
              timeDifferenceMax={timeDifferenceMax}
              setTimeDifferenceMax={setTimeDifferenceMax}
              siblingStartMax={siblingStartMax}
              setSiblingStartMax={setSiblingStartMax}
              morningStartTime={morningStartTime}
              setMorningStartTime={setMorningStartTime}
              morningEndTime={morningEndTime}
              setMorningEndTime={setMorningEndTime}
              afternoonStartTime={afternoonStartTime}
              setAfternoonStartTime={setAfternoonStartTime}
            />
            <FileUpload setStudents={handleStudentsChange} />
          </Box>
          <Students
            students={students}
            hasSchedule={performanceRooms.length > 0}
            timeDifferenceMin={timeDifferenceMin}
            timeDifferenceMax={timeDifferenceMax}
            siblingStartMax={siblingStartMax}
          />
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => scheduleStudents()}>
            Schedule
          </Button>
          <Box display="flex" gap={3} alignItems="flex-start" mt={4}>
            <Performances
              performanceRooms={performanceRooms}
              morningEndTime={morningEndTime}
              afternoonStartTime={afternoonStartTime}
            />
            <AuralTests
              auralTests={auralTests}
              auralStudentLimit={auralStudentLimit}
              morningEndTime={morningEndTime}
              afternoonStartTime={afternoonStartTime}
            />
          </Box>
        </Container>
      </main>
    </ThemeProvider>
  );
}

export default App;
