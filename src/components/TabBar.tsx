import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
import { memo } from 'react';
import { useAppStore, useTemporalStore } from '../store/useAppStore';
import exportToFile from '../utils/exportToFile';

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
    getConflictCount,
  ] = useAppStore((state) => [
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
    state.getConflictCount,
  ]);
  const {
    undo,
    redo,
    clear: clearTemporalStates,
    futureStates,
    pastStates,
  } = useTemporalStore((state) => state);
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

  function clearAll() {
    clear();
    clearTemporalStates();
  }

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Box>
        <Button disabled={!canSchedule} variant="contained" onClick={() => scheduleStudents()}>
          Schedule
        </Button>
        <Button disabled={!canExport} sx={{ ml: 3 }} onClick={() => handleExport()}>
          Export
        </Button>
        <Button sx={{ ml: 3 }} onClick={() => clearAll()}>
          Clear
        </Button>
        <Button sx={{ ml: 3 }} disabled={!pastStates.length} onClick={() => undo()}>
          Undo
        </Button>
        <Button sx={{ ml: 3 }} disabled={!futureStates.length} onClick={() => redo()}>
          Redo
        </Button>
      </Box>
      <Box>
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
      <Typography color={getConflictCount() > 0 ? 'error' : ''}>
        Conflicts: {getConflictCount() || 0}
      </Typography>
    </Box>
  );
};

export default memo(TabBar);
