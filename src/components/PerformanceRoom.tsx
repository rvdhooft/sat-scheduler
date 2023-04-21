import { Box, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { PerformanceRoom, SatPerformance } from '../models';
import PerformanceRow from './Performance';
import update from 'immutability-helper';
import { useAppStore } from '../store/useAppStore';

interface Props {
  room: PerformanceRoom;
  allRooms: PerformanceRoom[];
  updatePerformances: (room: PerformanceRoom) => void;
  moveRooms: (performanceIndex: number, room: PerformanceRoom, roomId: string) => void;
}

const PerformanceRoomTable = ({ room, allRooms, updatePerformances, moveRooms }: Props) => {
  const [performances, setPerformances] = useState<SatPerformance[]>(room.performances);
  const students = useAppStore((state) => state.students);

  useEffect(() => {
    setPerformances(room.performances);
  }, [room.performances]);

  const move = (dragIndex: number, hoverIndex: number) => {
    setPerformances((prev) =>
      update(prev, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prev[dragIndex]],
        ],
      })
    );
  };

  function getAlternateRooms(performance: SatPerformance): string[] {
    const level = students.find((x) => x.id === performance.student)?.level;
    if (!level) return [];
    return allRooms.filter((x) => x.id !== room.id && x.levels.includes(level)).map((x) => x.id);
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
              key={p.student}
              index={j}
              performance={p}
              room={room}
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
