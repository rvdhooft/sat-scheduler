import { Box, Typography } from '@mui/material';
import { compareAsc } from 'date-fns';
import { useState, useEffect } from 'react';
import { PerformanceRoom, SatPerformance } from '../models';
import PerformanceRow from './Performance';
import update from 'immutability-helper';

interface Props {
  room: PerformanceRoom;
  morningEndTime: Date;
  afternoonStartTime: Date;
  allRooms: PerformanceRoom[];
  updatePerformances: (room: PerformanceRoom) => void;
  moveRooms: (performanceIndex: number, room: PerformanceRoom, roomId: string) => void;
}

const PerformanceRoomTable = ({
  room,
  morningEndTime,
  afternoonStartTime,
  allRooms,
  updatePerformances,
  moveRooms,
}: Props) => {
  const [performances, setPerformances] = useState<SatPerformance[]>([]);

  useEffect(() => {
    setPerformances(room.performances.sort((a, b) => compareAsc(a.time, b.time)));
  }, [room.performances]);

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

  function getAlternateRooms(performance: SatPerformance): string[] {
    return allRooms
      .filter((x) => x.id !== room.id && x.levels.includes(performance.student.level))
      .map((x) => x.id);
  }

  return (
    <Box mt={2}>
      <Typography variant="h6" mb={1}>
        Room {room.id} <small>({room.levels?.join(', ')})</small>
      </Typography>
      <table cellSpacing="0" cellPadding="0">
        <thead>
          <Box component="tr" sx={{ '& th': { textAlign: 'left', px: 2 } }}>
            <th>Time</th>
            <th>Student</th>
            <th>Aural Test Time</th>
            <th>Level</th>
            <th>Request</th>
            <th>Siblings</th>
          </Box>
        </thead>
        <tbody>
          {performances.map((p, j) => (
            <PerformanceRow
              key={p.student.id}
              index={j}
              performance={p}
              room={room}
              morningEndTime={morningEndTime}
              afternoonStartTime={afternoonStartTime}
              alternateRooms={getAlternateRooms(p)}
              moveRooms={(roomId) => moveRooms(j, room, roomId)}
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

export default PerformanceRoomTable;
