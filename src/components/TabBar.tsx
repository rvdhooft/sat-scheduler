import { Box, Button, Tabs, Tab } from '@mui/material';
import { useAppStore } from '../store/useAppStore';
import exportToFile from '../utils/exportToFile';
import { shallow } from 'zustand/shallow';

const TabBar = () => {
  const [
    day,
    setDay,
    students,
    performanceRoomsDay1,
    performanceRoomsDay2,
    auralTestsDay1,
    auralTestsDay2,
    auralRoomCount,
    scheduleStudents,
    clear,
  ] = useAppStore(
    (state) => [
      state.day,
      state.setDay,
      state.students,
      state.performanceRoomsDay1,
      state.performanceRoomsDay2,
      state.auralTestsDay1,
      state.auralTestsDay2,
      state.auralRoomCount,
      state.schedule,
      state.clear,
    ],
    shallow
  );
  const canSchedule = !!students.length;
  const canExport = !!auralTestsDay1?.length || !!auralTestsDay2?.length;

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

  return (
    <>
      <Box sx={{ position: 'absolute', top: '0.625rem', zIndex: 1 }}>
        <Button disabled={!canSchedule} variant="contained" onClick={() => scheduleStudents()}>
          Schedule
        </Button>
        <Button disabled={!canExport} sx={{ ml: 3 }} onClick={() => handleExport()}>
          Export
        </Button>
        <Button sx={{ ml: 3 }} onClick={() => clear()}>
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
    </>
  );
};

export default TabBar;
