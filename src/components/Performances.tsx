import { Box, Typography } from '@mui/material';
import { PerformanceRoom } from '../models';
import PerformanceRoomTable from './PerformanceRoom';
import { useAppStore } from '../store/useAppStore';
import { memo } from 'react';

const Performances = () => {
  const performanceRooms = useAppStore((state) => state.getPerformanceRoomsForDay());
  const updatePerformances = useAppStore((state) => state.updatePerformances);

  if (!performanceRooms.length || !performanceRooms[0].performances.length)
    return <Typography>None</Typography>;

  const moveRooms = (performanceIndex: number, room: PerformanceRoom, roomId: string) => {
    const student = room.performances[performanceIndex]?.student;
    room.performances.splice(performanceIndex, 1);
    updatePerformances(room);
    const newRoom = performanceRooms.find((x) => x.id === roomId);
    if (!newRoom) return;
    newRoom.performances.push({ time: new Date(), student });
    updatePerformances(newRoom);
  };

  return (
    <Box flex={1}>
      <Typography variant="h5" component="h3">
        Performances
      </Typography>
      <Box>
        {performanceRooms.map((room) => (
          <PerformanceRoomTable
            room={room}
            key={room.id}
            updatePerformances={updatePerformances}
            moveRooms={moveRooms}
            allRooms={performanceRooms}
          />
        ))}
      </Box>
    </Box>
  );
};

export default memo(Performances);
