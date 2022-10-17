import update from 'immutability-helper';
import { ThemeProvider } from '@emotion/react';
import { theme } from './theme';
import { AppBar, Box, Button, Container, CssBaseline, Toolbar, Typography } from '@mui/material';
import FileUpload from './components/FileUpload';
import { useEffect, useState } from 'react';
import { AuralTest, PerformanceRoom, SatPerformance, Student } from './models';
import { compareAsc, addMinutes, isBefore, differenceInMinutes, isAfter } from 'date-fns';
import OptionFormFields from './components/OptionFormFields';
import Students from './components/Students';
import Performances from './components/Performances';
import AuralTests from './components/AuralTests';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import exportToFile from './utils/exportToFile';
import sortStudents from './utils/sortStudents';
import generateTestData from './utils/generateTestData';
import {
  getAuralTests,
  getPerformanceRooms,
  getStudents,
  saveAuralTests,
  savePerformanceRooms,
  saveStudents,
} from './utils/localStorage';

function App() {
  const [students, setStudents] = useState<Student[]>(getStudents() || []);
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

  const [performanceRooms, setPerformanceRooms] = useState<PerformanceRoom[]>(
    getPerformanceRooms() || []
  );
  const [auralTests, setAuralTests] = useState<AuralTest[]>(getAuralTests() || []);

  useEffect(() => {
    saveStudents(students);
  }, [students]);

  useEffect(() => {
    savePerformanceRooms(performanceRooms);
  }, [performanceRooms]);

  useEffect(() => {
    saveAuralTests(auralTests);
  }, [auralTests]);

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
    const levels = ['1a', '1b', '2', '3', '4', '5'];
    let levelIndex = 0;
    const tests = [];
    let time = morningStartTime;

    while (isBefore(time, morningEndTime)) {
      // skip over 10 am so they get a ~15 min break
      if (!(time.getHours() == 10 && time.getMinutes() === 0)) {
        for (let i = 0; i < auralRoomCount; i++) {
          tests.push({ time, level: levels[levelIndex], students: [] });
          levelIndex = (levelIndex + 1) % levels.length;
        }
      }
      time = addMinutes(time, auralTimeAllowance);
    }
    time = afternoonStartTime;
    while (isBefore(time, afternoonEndTime)) {
      for (let i = 0; i < auralRoomCount; i++) {
        tests.push({ time, level: levels[levelIndex], students: [] });
        levelIndex = (levelIndex + 1) % levels.length;
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

  function getNextMorningTime(performances: SatPerformance[]) {
    const filtered = performances
      .filter((x) => x.time < morningEndTime)
      .sort((a, b) => compareAsc(b.time, a.time));
    if (!filtered?.length) return morningStartTime;
    return getNextAvailableTimeFromPerformance(filtered[0]);
  }

  function getNextAfternoonTime(performances: SatPerformance[]) {
    const filtered = performances
      .filter((x) => x.time >= afternoonStartTime)
      .sort((a, b) => compareAsc(b.time, a.time));
    if (!filtered?.length) return afternoonStartTime;
    return getNextAvailableTimeFromPerformance(filtered[0]);
  }

  function getNextAvailableTime(performances: SatPerformance[], request?: string) {
    if (request === 'PM') {
      return getNextAfternoonTime(performances);
    }
    let nextTime = getNextMorningTime(performances);
    if (nextTime.getHours() === 10 && nextTime.getMinutes() < 15) {
      // 15 minute break
      nextTime = addMinutes(nextTime, 15);
    }
    if (isAfter(nextTime, morningEndTime)) {
      return getNextAfternoonTime(performances);
    }
    return nextTime;
  }

  function scheduleStudents() {
    const perfRooms = createPerformanceRooms();
    const auralTests = createAuralTests();

    for (const student of students) {
      // Schedule Performance
      const roomForLevel = perfRooms.find((x) => x.level === student['SAT Level']);
      if (!roomForLevel) continue;
      const nextAvailableTime = getNextAvailableTime(
        roomForLevel.performances,
        student['Scheduling Requests']
      );
      roomForLevel.performances.push({ time: nextAvailableTime, student });
      student.performanceTime = nextAvailableTime;

      // Schedule Aural Test
      const auralsInTimeRange = auralTests.filter((x) => {
        const difference = Math.abs(differenceInMinutes(student.performanceTime as Date, x.time));
        return difference >= timeDifferenceMin && difference <= timeDifferenceMax;
      });
      const matches = auralsInTimeRange
        .filter((x) => x.level === student['SAT Level'] && x.students.length <= auralStudentLimit)
        .sort(
          (a, b) =>
            Math.abs(differenceInMinutes(a.time, student.performanceTime!)) -
            Math.abs(differenceInMinutes(b.time, student.performanceTime!))
        );
      if (matches.length) {
        matches[0].students.push(student);
        student.auralTestTime = matches[0].time;
      }
    }

    // Re-assign any unused aural test spots if needed
    for (const student of students.filter((x) => !x.auralTestTime)) {
      if (!student.performanceTime) continue;
      const emptyAuralsInTimeRange = auralTests.filter((x) => {
        if (x.students.length) return false;
        const difference = Math.abs(differenceInMinutes(student.performanceTime as Date, x.time));
        return difference >= timeDifferenceMin && difference <= timeDifferenceMax;
      });
      if (!emptyAuralsInTimeRange) continue;
      emptyAuralsInTimeRange[0].level = student['SAT Level'];
      emptyAuralsInTimeRange[0].students.push(student);
      student.auralTestTime = emptyAuralsInTimeRange[0].time;
    }

    setPerformanceRooms(perfRooms);
    setAuralTests(auralTests);
    saveStudents(students);
  }

  function getNextTime(lastPerformance: SatPerformance) {
    let nextTime = getNextAvailableTimeFromPerformance(lastPerformance);
    if (nextTime.getHours() === 10 && nextTime.getMinutes() < 15) {
      // 15 minute break
      nextTime = addMinutes(nextTime, 15);
    }
    if (isAfter(nextTime, morningEndTime) && isBefore(nextTime, afternoonStartTime)) {
      return afternoonStartTime;
    }
    return nextTime;
  }

  function reassignTimes(performances: SatPerformance[]) {
    const updatedStudents = [...students];
    for (let i = 0; i < performances.length; i++) {
      if (i == 0) {
        performances[i].time = morningStartTime;
        const student = updatedStudents.find(
          (x) =>
            x['Student First Name'] == performances[i].student['Student First Name'] &&
            x['Student Last Name'] === performances[i].student['Student Last Name']
        );
        if (student) student.performanceTime = morningStartTime;
        continue;
      }

      const nextTime = getNextTime(performances[i - 1]);
      performances[i].time = nextTime;
      const student = updatedStudents.find(
        (x) =>
          x['Student First Name'] == performances[i].student['Student First Name'] &&
          x['Student Last Name'] === performances[i].student['Student Last Name']
      );
      if (student) student.performanceTime = nextTime;
    }
    setStudents(updatedStudents);
  }

  const updatePerformances = (room: PerformanceRoom) => {
    reassignTimes(room.performances);
    const index = performanceRooms.findIndex((x) => x.level === room.level);
    setPerformanceRooms((prev: PerformanceRoom[]) =>
      update(prev, {
        $splice: [
          [index, 1],
          [index, 0, room],
        ],
      })
    );
  };

  const updateAuralTests = (tests: AuralTest[]) => {
    for (const test of tests) {
      for (const student of test.students) {
        student.auralTestTime = test.time;
      }
    }
    setAuralTests(tests);
  };

  const handleStudentsChange = (students: Student[]) => {
    students.sort(sortStudents(students));
    setStudents(students);
  };

  const generateTestStudents = () => {
    setStudents(generateTestData());
    setPerformanceRooms([]);
    setAuralTests([]);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DndProvider backend={HTML5Backend}>
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
              <Box display="flex" flexDirection="column">
                <FileUpload setStudents={handleStudentsChange} />
                <Button color="secondary" onClick={generateTestStudents}>
                  Generate Random Students
                </Button>
              </Box>
            </Box>
            <Students
              students={students}
              hasSchedule={performanceRooms.length > 0}
              timeDifferenceMin={timeDifferenceMin}
              timeDifferenceMax={timeDifferenceMax}
              siblingStartMax={siblingStartMax}
            />
            <Box mt={2}>
              {students.length > 0 && (
                <Button variant="contained" onClick={() => scheduleStudents()}>
                  Schedule
                </Button>
              )}
              {performanceRooms.length > 0 && (
                <Button
                  variant="contained"
                  sx={{ ml: 3 }}
                  onClick={() =>
                    exportToFile(students, performanceRooms, auralTests, auralRoomCount)
                  }
                >
                  Export
                </Button>
              )}
            </Box>
            <Box display="flex" gap={3} alignItems="flex-start" mt={4}>
              <Performances
                performanceRooms={performanceRooms}
                morningEndTime={morningEndTime}
                afternoonStartTime={afternoonStartTime}
                updatePerformances={updatePerformances}
              />
              <AuralTests
                auralTests={auralTests}
                auralStudentLimit={auralStudentLimit}
                morningEndTime={morningEndTime}
                afternoonStartTime={afternoonStartTime}
                updateAuralTests={updateAuralTests}
              />
            </Box>
          </Container>
        </main>
      </DndProvider>
    </ThemeProvider>
  );
}

export default App;
