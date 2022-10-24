import { Box, Typography } from '@mui/material';
import { PerformanceRoom } from '../models';
import PerformanceRoomTable from './PerformanceRoom';

interface Props {
  performanceRooms: PerformanceRoom[];
  morningEndTime: Date;
  afternoonStartTime: Date;
  updatePerformances: (room: PerformanceRoom) => void;
}

const Performances = ({
  performanceRooms,
  morningEndTime,
  afternoonStartTime,
  updatePerformances,
}: Props) => {
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
            morningEndTime={morningEndTime}
            afternoonStartTime={afternoonStartTime}
            updatePerformances={updatePerformances}
            moveRooms={moveRooms}
            allRooms={performanceRooms}
          />
        ))}
      </Box>
    </Box>
  );
};

export default Performances;
