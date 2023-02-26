import update from 'immutability-helper';
import { Tab, Tabs, ThemeProvider } from '@mui/material';
import { theme } from './theme';
import { AppBar, Box, Button, Container, CssBaseline, Toolbar, Typography } from '@mui/material';
import FileUpload from './components/FileUpload';
import { useEffect, useState } from 'react';
import { AuralTest, PerformanceRoom, SatPerformance, SchedulingRequest, Student } from './models';
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
  clearStorage,
  getAuralTestsDay1,
  getAuralTestsDay2,
  getPerformanceRoomsDay1,
  getPerformanceRoomsDay2,
  saveAuralTestsDay1,
  saveAuralTestsDay2,
  savePerformanceRoomsDay1,
  savePerformanceRoomsDay2,
  saveStudents,
} from './utils/localStorage';
import { useStudents } from './contexts/studentContext';
import { useSatParams } from './contexts/paramContext';
import {
  createDefaultPerformanceRoomsDay1,
  createDefaultPerformanceRoomsDay2,
} from './utils/performanceRoomDefaults';
import isTimeDifferenceInRange from './utils/isTimeDifferenceInRange';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';

function App() {
  const { students, setStudents } = useStudents();
  const {
    auralRoomCount,
    auralStudentLimit,
    auralTimeAllowance,
    levels,
    timeDifferenceMin,
    timeDifferenceMax,
    morningStartTime,
    morningEndTime,
    afternoonStartTime,
    afternoonEndTime,
  } = useSatParams();

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

  function getTimeAllowance(student: Student) {
    return levels.find((x) => x.name === student.level)?.timeAllowanceInMinutes;
  }

  function getNextAvailableTimeFromPerformance(performance: SatPerformance) {
    const minutesForLevel = getTimeAllowance(performance.student);
    return addMinutes(performance.time, minutesForLevel || 0);
  }

  function scheduleStudents() {
    scheduleStudentsForDay(0);
    scheduleStudentsForDay(1);
  }

  function scheduleAuralTest(auralTests: AuralTest[], student: Student) {
    const auralsInTimeRange = auralTests.filter((x) =>
      isTimeDifferenceInRange(student.performanceTime, x.time, timeDifferenceMin, timeDifferenceMax)
    );
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
    } else {
      student.auralTestTime = undefined;
    }
  }

  function getPerformanceTime(room: PerformanceRoom, student: Student) {
    if (
      !room.latestAfternoonTime ||
      !room.latestMorningTime ||
      !room.nextMorningTime ||
      !room.nextAfternoonTime
    )
      return;

    const timeAllowance = getTimeAllowance(student);
    if (!timeAllowance) return;

    if (student.request === SchedulingRequest.LateAM) {
      let performanceTime = addMinutes(room.latestMorningTime, -1 * timeAllowance);
      if (performanceTime.getHours() === 10 && performanceTime.getMinutes() < 15) {
        // 15 minute break
        performanceTime = addMinutes(performanceTime, -15);
      }
      if (isBefore(performanceTime, room.nextMorningTime)) {
        // if this would cause overlap, skip to afternoon
        return getNextAfternoonTime(room, timeAllowance);
      }

      room.latestMorningTime = performanceTime;
      return performanceTime;
    }
    if (student.request === SchedulingRequest.LatePM) {
      const performanceTime = addMinutes(room.latestAfternoonTime, -1 * timeAllowance);
      if (isBefore(performanceTime, room.nextAfternoonTime)) return; // don't cause overlap, so just bail out

      room.latestAfternoonTime = performanceTime;
      return performanceTime;
    }
    if (student.request === SchedulingRequest.EarlyPM || student.request === SchedulingRequest.PM) {
      return getNextAfternoonTime(room, timeAllowance);
    }

    // By default, schedule the next morning time
    let nextTimeAfterPerformance = addMinutes(room.nextMorningTime, timeAllowance);
    if (isAfter(nextTimeAfterPerformance, room.latestMorningTime)) {
      // if we're out of morning times, skip to afternoon
      return getNextAfternoonTime(room, timeAllowance);
    }
    const performanceTime = room.nextMorningTime;
    if (nextTimeAfterPerformance.getHours() === 10 && nextTimeAfterPerformance.getMinutes() < 15) {
      // 15 minute break
      nextTimeAfterPerformance = addMinutes(nextTimeAfterPerformance, 15);
    }
    room.nextMorningTime = nextTimeAfterPerformance;
    return performanceTime;
  }

  function getNextAfternoonTime(room: PerformanceRoom, timeAllowance: number) {
    const nextTimeAfterPerformance = addMinutes(room.nextAfternoonTime!, timeAllowance);
    if (isAfter(nextTimeAfterPerformance, room.latestAfternoonTime!)) return;

    const performanceTime = room.nextAfternoonTime;
    room.nextAfternoonTime = nextTimeAfterPerformance;
    return performanceTime;
  }

  function scheduleStudentsForDay(day: number) {
    const perfRooms: PerformanceRoom[] = (
      day === 0 ? performanceRoomsDay1 : performanceRoomsDay2
    ).map((x) => ({
      ...x,
      performances: [],
      nextMorningTime: morningStartTime,
      latestMorningTime: x.morningEndTime,
      nextAfternoonTime: x.afternoonStartTime,
      latestAfternoonTime: afternoonEndTime,
    }));
    const auralTests = createAuralTests(day);
    const levelsForDay = getLevelsForDay(day);

    for (const student of students.filter((x) => levelsForDay.includes(x.level))) {
      // Schedule Performance
      let roomForLevel = perfRooms.find((x) => x.levels[0] === student.level);
      if (!roomForLevel) roomForLevel = perfRooms.find((x) => x.levels.includes(student.level));
      if (!roomForLevel) continue;
      let performanceTime = getPerformanceTime(roomForLevel, student);
      if (!performanceTime) {
        // If no time is found, try another room
        roomForLevel = perfRooms.find(
          (x) => x.id !== roomForLevel?.id && x.levels.includes(student.level)
        );
        if (!roomForLevel) continue;
        performanceTime = getPerformanceTime(roomForLevel, student);
      }
      if (!performanceTime) continue;
      roomForLevel.performances.push({ time: performanceTime, student });
      student.performanceTime = performanceTime;
      student.performanceRoom = roomForLevel.id;

      scheduleAuralTest(auralTests, student);
    }
    perfRooms.forEach((x) => {
      x.performances.sort((a, b) => compareAsc(a.time, b.time));
      reassignTimes(x, auralTests); // removes any gaps
    });

    // Go back through those without aural test times
    // Re-assign any unused aural test spots if that helps
    // Otherwise just give them whatever is closest
    for (const student of students.filter(
      (x) => !x.auralTestTime && levelsForDay.includes(x.level)
    )) {
      if (!student.performanceTime) continue;

      const auralsForLevelOrEmpty = auralTests.filter(
        (x) =>
          (x.level === student.level || !x.students.length) &&
          Math.abs(differenceInMinutes(x.time, student.performanceTime!)) >= timeDifferenceMin
      );
      auralsForLevelOrEmpty.sort(
        (a, b) =>
          Math.abs(differenceInMinutes(a.time, student.performanceTime!)) -
          Math.abs(differenceInMinutes(b.time, student.performanceTime!))
      );
      const closestAuralTest = auralsForLevelOrEmpty[0];
      closestAuralTest.students.push(student);
      student.auralTestTime = closestAuralTest.time;
      closestAuralTest.level = student.level;
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

  function getNextTime(
    lastPerformance: SatPerformance,
    request: SchedulingRequest | undefined,
    morningEndTime: Date,
    afternoonStartTime: Date
  ) {
    let nextTime = getNextAvailableTimeFromPerformance(lastPerformance);
    if (nextTime.getHours() === 10 && nextTime.getMinutes() < 15) {
      // 15 minute break
      nextTime = addMinutes(nextTime, 15);
    }
    if (
      isBefore(nextTime, afternoonStartTime) &&
      (isAfter(nextTime, morningEndTime) ||
        request === SchedulingRequest.PM ||
        request === SchedulingRequest.EarlyPM ||
        request === SchedulingRequest.LatePM)
    ) {
      return afternoonStartTime;
    }
    return nextTime;
  }

  function reassignTimes(room: PerformanceRoom, auralTests: AuralTest[]) {
    const updatedStudents = [...students];
    for (let i = 0; i < room.performances.length; i++) {
      let nextTime;
      if (i == 0) {
        nextTime = morningStartTime;
      } else {
        nextTime = getNextTime(
          room.performances[i - 1],
          room.performances[i].student.request,
          room.morningEndTime,
          room.afternoonStartTime
        );
        room.performances[i].time = nextTime;
      }
      room.performances[i].time = nextTime;

      const student = updatedStudents.find((x) => x.id === room.performances[i].student.id);
      if (!student) continue;
      student.performanceTime = nextTime;
      if (
        !student.auralTestTime ||
        !isTimeDifferenceInRange(
          student.performanceTime,
          student.auralTestTime,
          timeDifferenceMin,
          timeDifferenceMax
        )
      ) {
        scheduleAuralTest(auralTests, student);
      }
    }
    setStudents(updatedStudents);
  }

  const updatePerformances = (room: PerformanceRoom) => {
    const auralTests = day === 0 ? [...auralTestsDay1] : [...auralTestsDay2];
    reassignTimes(room, auralTests);
    if (day === 0) {
      setAuralTestsDay1(auralTests);
    } else {
      setAuralTestsDay2(auralTests);
    }
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

  const handleExport = () => {
    exportToFile(
      students,
      performanceRoomsDay1,
      performanceRoomsDay2,
      auralTestsDay1,
      auralTestsDay2,
      auralRoomCount
    );
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
    clearStorage();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DndProvider backend={HTML5Backend}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
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
                <OptionFormFields />
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
                  <Button disabled={!auralTestsDay1.length} sx={{ ml: 3 }} onClick={handleExport}>
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
                  />
                </TabPanel>
                <TabPanel value={tab} index={2}>
                  <Performances
                    performanceRooms={day === 0 ? performanceRoomsDay1 : performanceRoomsDay2}
                    updatePerformances={updatePerformances}
                  />
                </TabPanel>
                <TabPanel value={tab} index={3}>
                  <AuralTests
                    auralTests={day === 0 ? auralTestsDay1 : auralTestsDay2}
                    updateAuralTests={updateAuralTests}
                  />
                </TabPanel>
              </Box>
            </Container>
          </main>
        </LocalizationProvider>
      </DndProvider>
    </ThemeProvider>
  );
}

export default App;
