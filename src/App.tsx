import update from 'immutability-helper';
import { Tab, Tabs, ThemeProvider } from '@mui/material';
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
import PerformanceRoomForm from './components/PerformanceRoomForm';
import TabPanel from './components/TabPanel';
import {
  getAuralTestsDay1,
  getAuralTestsDay2,
  getPerformanceRoomsDay1,
  getPerformanceRoomsDay2,
  getStudents,
  saveAuralTestsDay1,
  saveAuralTestsDay2,
  savePerformanceRoomsDay1,
  savePerformanceRoomsDay2,
  saveStudents,
} from './utils/localStorage';

function createDefaultPerformanceRoomsDay1() {
  return [
    { id: '1', levels: ['1a'], performances: [] },
    { id: '2', levels: ['1b'], performances: [] },
    { id: '3', levels: ['2'], performances: [] },
    { id: '4', levels: ['3'], performances: [] },
    { id: '5', levels: ['4'], performances: [] },
    { id: '6', levels: ['5'], performances: [] },
  ];
}

function createDefaultPerformanceRoomsDay2() {
  return [
    { id: '1', levels: ['6'], performances: [] },
    { id: '2', levels: ['7'], performances: [] },
    { id: '3', levels: ['8'], performances: [] },
    { id: '4', levels: ['9'], performances: [] },
    { id: '5', levels: ['10'], performances: [] },
    { id: '6', levels: ['11', '12'], performances: [] },
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
  const [tab, setTab] = useState(0);
  const [day, setDay] = useState(0);

  const [performanceRoomsDay1, setPerformanceRoomsDay1] = useState<PerformanceRoom[]>(
    getPerformanceRoomsDay1() || createDefaultPerformanceRoomsDay1()
  );
  const [performanceRoomsDay2, setPerformanceRoomsDay2] = useState<PerformanceRoom[]>(
    getPerformanceRoomsDay2() || createDefaultPerformanceRoomsDay2()
  );
  const [auralTestsDay1, setAuralTestsDay1] = useState<AuralTest[]>(getAuralTestsDay1() || []);
  const [auralTestsDay2, setAuralTestsDay2] = useState<AuralTest[]>(getAuralTestsDay2() || []);

  useEffect(() => {
    saveStudents(students);
  }, [students]);

  useEffect(() => {
    savePerformanceRoomsDay1(performanceRoomsDay1);
  }, [performanceRoomsDay1]);

  useEffect(() => {
    savePerformanceRoomsDay2(performanceRoomsDay2);
  }, [performanceRoomsDay2]);

  useEffect(() => {
    saveAuralTestsDay1(auralTestsDay1);
  }, [auralTestsDay1]);

  useEffect(() => {
    saveAuralTestsDay2(auralTestsDay2);
  }, [auralTestsDay2]);

  function studentsByDay(day: number) {
    const levels = getLevelsForDay(day);
    return students.filter((x) => levels.includes(x.level));
  }

  function getLevelsForDay(day: number) {
    const levels = (day === 0 ? performanceRoomsDay1 : performanceRoomsDay2)
      .map((x) => x.levels)
      .flat();
    return [...new Set(levels)]; // get rid of duplicates
  }

  function createAuralTests(day: number): AuralTest[] {
    const auralTestLevels = getLevelsForDay(day);
    let levelIndex = 0;
    const tests = [];
    let time = morningStartTime;

    while (isBefore(time, morningEndTime)) {
      // skip over 10 am so they get a ~15 min break
      if (!(time.getHours() == 10 && time.getMinutes() === 0)) {
        for (let i = 0; i < auralRoomCount; i++) {
          tests.push({ time, level: auralTestLevels[levelIndex], students: [] });
          levelIndex = (levelIndex + 1) % auralTestLevels.length;
        }
      }
      time = addMinutes(time, auralTimeAllowance);
    }
    time = afternoonStartTime;
    while (isBefore(time, afternoonEndTime)) {
      for (let i = 0; i < auralRoomCount; i++) {
        tests.push({ time, level: auralTestLevels[levelIndex], students: [] });
        levelIndex = (levelIndex + 1) % auralTestLevels.length;
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
    scheduleStudentsForDay(0);
    scheduleStudentsForDay(1);
  }

  function scheduleStudentsForDay(day: number) {
    const perfRooms: PerformanceRoom[] = (
      day === 0 ? performanceRoomsDay1 : performanceRoomsDay2
    ).map((x) => ({
      ...x,
      performances: [],
    }));
    const auralTests = createAuralTests(day);

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

    if (day === 0) {
      setPerformanceRoomsDay1(perfRooms);
      setAuralTestsDay1(auralTests);
    } else {
      setPerformanceRoomsDay2(perfRooms);
      setAuralTestsDay2(auralTests);
    }
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
    if (day === 0) {
      const index = performanceRoomsDay1.findIndex((x) => x.id === room.id);
      setPerformanceRoomsDay1((prev: PerformanceRoom[]) =>
        update(prev, {
          $splice: [
            [index, 1],
            [index, 0, room],
          ],
        })
      );
    } else {
      const index = performanceRoomsDay2.findIndex((x) => x.id === room.id);
      setPerformanceRoomsDay2((prev: PerformanceRoom[]) =>
        update(prev, {
          $splice: [
            [index, 1],
            [index, 0, room],
          ],
        })
      );
    }
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
    if (day === 0) {
      setAuralTestsDay1(tests);
    } else {
      setAuralTestsDay2(tests);
    }
  };

  function resetRooms() {
    setPerformanceRoomsDay1(performanceRoomsDay1.map((x) => ({ ...x, performances: [] })));
    setPerformanceRoomsDay2(performanceRoomsDay2.map((x) => ({ ...x, performances: [] })));
    setAuralTestsDay1([]);
    setAuralTestsDay2([]);
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
    setAuralTestsDay1([]);
    setAuralTestsDay2([]);
    setPerformanceRoomsDay1(createDefaultPerformanceRoomsDay1());
    setPerformanceRoomsDay2(createDefaultPerformanceRoomsDay2());
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
            <Box
              sx={{
                position: 'sticky',
                top: 0,
                backgroundColor: 'white',
                borderBottom: 1,
                borderColor: 'divider',
                my: 4,
                pt: 1,
              }}
            >
              <Box sx={{ position: 'absolute', top: '0.625rem', zIndex: 1 }}>
                <Button
                  disabled={!students.length}
                  variant="contained"
                  onClick={() => scheduleStudents()}
                >
                  Schedule
                </Button>
                <Button
                  disabled={!auralTestsDay1.length}
                  sx={{ ml: 3 }}
                  onClick={() =>
                    exportToFile(students, performanceRoomsDay1, auralTestsDay1, auralRoomCount)
                  }
                >
                  Export
                </Button>
                <Button disabled={!students.length} sx={{ ml: 3 }} onClick={clear}>
                  Clear
                </Button>
              </Box>
              <Tabs
                value={day}
                onChange={(_event, newValue) => setDay(newValue)}
                centered
                sx={{
                  '& .MuiTab-root': { width: '9rem', fontSize: '1.125rem' },
                }}
              >
                <Tab label="Day 1" />
                <Tab label="Day 2" />
              </Tabs>
            </Box>
            <Box display="flex" alignItems="flex-start">
              <Tabs
                textColor="secondary"
                indicatorColor="secondary"
                orientation="vertical"
                variant="scrollable"
                value={tab}
                onChange={(_event, newValue) => setTab(newValue)}
                sx={{
                  minWidth: '11rem',
                  maxWidth: '9rem',
                  position: 'sticky',
                  top: '5rem',
                }}
              >
                <Tab label="Performance Rooms" />
                <Tab label="Students" />
                <Tab label="Performances" />
                <Tab label="Aural Tests" />
              </Tabs>
              <TabPanel value={tab} index={0}>
                <PerformanceRoomForm
                  performanceRooms={day === 0 ? performanceRoomsDay1 : performanceRoomsDay2}
                  setPerformanceRooms={
                    day === 0 ? setPerformanceRoomsDay1 : setPerformanceRoomsDay2
                  }
                  levels={levels}
                  students={students}
                />
              </TabPanel>
              <TabPanel value={tab} index={1}>
                <Students
                  students={day === 0 ? studentsByDay(0) : studentsByDay(1)}
                  hasSchedule={auralTestsDay1.length > 0}
                  timeDifferenceMin={timeDifferenceMin}
                  timeDifferenceMax={timeDifferenceMax}
                  siblingStartMax={siblingStartMax}
                />
              </TabPanel>
              <TabPanel value={tab} index={2}>
                <Performances
                  performanceRooms={day === 0 ? performanceRoomsDay1 : performanceRoomsDay2}
                  morningEndTime={morningEndTime}
                  afternoonStartTime={afternoonStartTime}
                  updatePerformances={updatePerformances}
                />
              </TabPanel>
              <TabPanel value={tab} index={3}>
                <AuralTests
                  auralTests={day === 0 ? auralTestsDay1 : auralTestsDay2}
                  auralStudentLimit={auralStudentLimit}
                  morningEndTime={morningEndTime}
                  afternoonStartTime={afternoonStartTime}
                  updateAuralTests={updateAuralTests}
                />
              </TabPanel>
            </Box>
          </Container>
        </main>
      </DndProvider>
    </ThemeProvider>
  );
}

export default App;
