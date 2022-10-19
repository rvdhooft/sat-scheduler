import update from 'immutability-helper';
import { ThemeProvider } from '@mui/material';
import { theme } from './theme';
import { AppBar, Box, Button, Container, CssBaseline, Toolbar, Typography } from '@mui/material';
import FileUpload from './components/FileUpload';
import { useEffect, useState } from 'react';
import { AuralTest, Level, PerformanceRoom, SatPerformance, Student } from './models';
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
import PerformanceRoomForm from './components/PerformanceRoomForm';

function createDefaultPerformanceRooms() {
  return [
    { id: '1', levels: ['1a'], performances: [] },
    { id: '2', levels: ['1b'], performances: [] },
    { id: '3', levels: ['2'], performances: [] },
    { id: '4', levels: ['3'], performances: [] },
    { id: '5', levels: ['4'], performances: [] },
    { id: '6', levels: ['5'], performances: [] },
  ];
}

function App() {
  const [students, setStudents] = useState<Student[]>(getStudents() || []);
  const [auralRoomCount, setAuralRoomCount] = useState(2);
  const [auralStudentLimit, setAuralStudentLimit] = useState(12);
  const [auralTimeAllowance, setAuralTimeAllowance] = useState(15);
  const [levels, setLevels] = useState<Level[]>([
    { name: '1a', timeAllowanceInMinutes: 9 },
    { name: '1b', timeAllowanceInMinutes: 9 },
    { name: '2', timeAllowanceInMinutes: 9 },
    { name: '3', timeAllowanceInMinutes: 9 },
    { name: '4', timeAllowanceInMinutes: 10 },
    { name: '5', timeAllowanceInMinutes: 10 },
    { name: '6', timeAllowanceInMinutes: 11 },
    { name: '7', timeAllowanceInMinutes: 11 },
    { name: '8', timeAllowanceInMinutes: 14 },
    { name: '9', timeAllowanceInMinutes: 14 },
    { name: '10', timeAllowanceInMinutes: 17 },
    { name: '11', timeAllowanceInMinutes: 17 },
    { name: '12', timeAllowanceInMinutes: 17 },
  ]);
  const [timeDifferenceMin, setTimeDifferenceMin] = useState(20);
  const [timeDifferenceMax, setTimeDifferenceMax] = useState(60);
  const [siblingStartMax, setSiblingStartMax] = useState(20);
  const [morningStartTime, setMorningStartTime] = useState(new Date('2023-01-01T08:30:00'));
  const [morningEndTime, setMorningEndTime] = useState(new Date('2023-01-01T12:00:00'));
  const [afternoonStartTime, setAfternoonStartTime] = useState(new Date('2023-01-01T13:00:00'));
  const afternoonEndTime = new Date('2023-01-01T16:00:00');

  const [performanceRooms, setPerformanceRooms] = useState<PerformanceRoom[]>(
    getPerformanceRooms() || createDefaultPerformanceRooms()
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
    const minutesForLevel = levels.find(
      (x) => x.name === performance.student.level
    )?.timeAllowanceInMinutes;
    return addMinutes(performance.time, minutesForLevel || 0);
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
    const perfRooms: PerformanceRoom[] = performanceRooms.map((x) => ({ ...x, performances: [] }));
    const auralTests = createAuralTests();

    for (const student of students) {
      // Schedule Performance
      let roomForLevel = perfRooms.find((x) => x.levels[0] === student.level);
      if (!roomForLevel) roomForLevel = perfRooms.find((x) => x.levels.includes(student.level));
      if (!roomForLevel) continue;
      const nextAvailableTime = getNextAvailableTime(roomForLevel.performances, student.request);
      roomForLevel.performances.push({ time: nextAvailableTime, student });
      student.performanceTime = nextAvailableTime;
      student.performanceRoom = roomForLevel.id;

      // Schedule Aural Test
      const auralsInTimeRange = auralTests.filter((x) => {
        const difference = Math.abs(differenceInMinutes(student.performanceTime as Date, x.time));
        return difference >= timeDifferenceMin && difference <= timeDifferenceMax;
      });
      const matches = auralsInTimeRange
        .filter((x) => x.level === student.level && x.students.length <= auralStudentLimit)
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
      if (!emptyAuralsInTimeRange.length) continue;
      emptyAuralsInTimeRange[0].level = student.level;
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
        const student = updatedStudents.find((x) => x.id === performances[i].student.id);
        if (student) student.performanceTime = morningStartTime;
        continue;
      }

      const nextTime = getNextTime(performances[i - 1]);
      performances[i].time = nextTime;
      const student = updatedStudents.find((x) => x.id === performances[i].student.id);
      if (student) student.performanceTime = nextTime;
    }
    setStudents(updatedStudents);
  }

  const updatePerformances = (room: PerformanceRoom) => {
    reassignTimes(room.performances);
    const index = performanceRooms.findIndex((x) => x.id === room.id);
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
    const updatedStudents = [...students];
    for (const test of tests) {
      for (const s of test.students) {
        const student = updatedStudents.find((x) => x.id === s.id);
        if (student) student.auralTestTime = test.time;
      }
    }
    setStudents(updatedStudents);
    setAuralTests(tests);
  };

  function resetRooms() {
    setPerformanceRooms(performanceRooms.map((x) => ({ ...x, performances: [] })));
    setAuralTests([]);
  }

  const handleStudentsChange = (students: Student[]) => {
    students.sort(sortStudents(students));
    setStudents(students);
    resetRooms();
  };

  const generateTestStudents = () => {
    setStudents(generateTestData());
    resetRooms();
  };

  const clear = () => {
    setStudents([]);
    setAuralTests([]);
    setPerformanceRooms(createDefaultPerformanceRooms());
    localStorage.clear();
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
                auralRoomCount={auralRoomCount}
                setAuralRoomCount={setAuralRoomCount}
                auralTimeAllowance={auralTimeAllowance}
                setAuralTimeAllowance={setAuralTimeAllowance}
                levels={levels}
                setLevels={setLevels}
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
            <PerformanceRoomForm
              performanceRooms={performanceRooms}
              setPerformanceRooms={setPerformanceRooms}
              levels={levels}
              students={students}
            />
            <Students
              students={students}
              hasSchedule={auralTests.length > 0}
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
              {auralTests.length > 0 && (
                <>
                  <Button
                    variant="contained"
                    sx={{ ml: 3 }}
                    onClick={() =>
                      exportToFile(students, performanceRooms, auralTests, auralRoomCount)
                    }
                  >
                    Export
                  </Button>
                  <Button sx={{ ml: 3 }} onClick={clear}>
                    Clear
                  </Button>
                </>
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
