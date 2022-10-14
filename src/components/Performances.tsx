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
  if (!performanceRooms.length) return null;

  return (
    <Box flex={1}>
      <Typography variant="h6" component="h3">
        Performances
      </Typography>
      <Box>
        {performanceRooms.map((room, i) => (
          <PerformanceRoomTable
            room={room}
            key={i}
            morningEndTime={morningEndTime}
            afternoonStartTime={afternoonStartTime}
            updatePerformances={updatePerformances}
          />
        ))}
      </Box>
    </Box>
  );
};

export default Performances;
