import { Box, Typography } from '@mui/material';
import { compareAsc } from 'date-fns';
import { memo, useState } from 'react';
import { PerformanceRoom, SatPerformance } from '../models';
import PerformanceRow from './Performance';
import update from 'immutability-helper';

interface Props {
  room: PerformanceRoom;
  morningEndTime: Date;
  afternoonStartTime: Date;
  updatePerformances: (room: PerformanceRoom) => void;
}

const PerformanceRoomTable = ({
  room,
  morningEndTime,
  afternoonStartTime,
  updatePerformances,
}: Props) => {
  const [performances, setPerformances] = useState<SatPerformance[]>(
    room.performances.sort((a, b) => compareAsc(a.time, b.time))
  );

  const move = (dragIndex: number, hoverIndex: number) => {
    setPerformances(
      update(performances, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, performances[dragIndex]],
        ],
      })
    );
  };

  return (
    <Box mt={4}>
      <Typography variant="h6" component="h3">
        {room.level}
      </Typography>
      <table>
        <tbody>
          {performances.map((p, j) => (
            <PerformanceRow
              key={p.student.id}
              index={j}
              performance={p}
              room={room}
              morningEndTime={morningEndTime}
              afternoonStartTime={afternoonStartTime}
              move={move}
              commitMove={() => {
                updatePerformances({ ...room, performances });
              }}
            />
          ))}
        </tbody>
      </table>
    </Box>
  );
};

export default memo(PerformanceRoomTable);
