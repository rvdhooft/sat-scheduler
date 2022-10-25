import type { Identifier, XYCoord } from 'dnd-core';
import { Box, Typography } from '@mui/material';
import { isAfter, isBefore, isEqual } from 'date-fns';
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { PerformanceRoom, SatPerformance, Student } from '../models';
import formatTime from '../utils/formatTime';
import PerformanceMenu from './PerformanceMenu';
import { useStudents } from '../contexts/studentContext';
import getSiblings from '../utils/getSiblings';
import { useSatParams } from '../contexts/paramContext';

interface Props {
  performance: SatPerformance;
  index: number;
  room: PerformanceRoom;
  alternateRooms: string[];
  moveRooms: (roomId: string) => void;
  move: (dragIndex: number, hoverIndex: number) => void;
  commitMove: () => void;
}

interface DragItem {
  index: number;
  type: string;
}

const PerformanceRow = ({
  performance,
  room,
  index,
  alternateRooms,
  moveRooms,
  move,
  commitMove,
}: Props) => {
  const ref = useRef<HTMLTableRowElement>(null);
  const { students } = useStudents();
  const { morningEndTime, afternoonStartTime } = useSatParams();

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: `performance-${room.id}`,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    drop: () => commitMove(),
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      move(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: `performance-${room.id}`,
    item: () => {
      return { index };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  function showPerformanceLevelError(p: SatPerformance, roomLevels: string[]) {
    if (!roomLevels) return;
    if (!roomLevels.includes(p.student.level)) return true;
  }

  function showPerformanceRequestError(p: SatPerformance) {
    if (p.student.request === 'AM' && isAfter(p.time, morningEndTime)) return true;
    if (p.student.request === 'PM' && isBefore(p.time, afternoonStartTime)) return true;

    return false;
  }

  function showPerformanceTimeError(p: SatPerformance, room: PerformanceRoom) {
    if (room.performances.filter((x) => isEqual(x.time, p.time)).length > 1) return true;
  }

  return (
    <Box
      ref={ref}
      data-handler-id={handlerId}
      component="tr"
      sx={{
        '& td': { padding: '0.25rem 1rem', verticalAlign: 'top' },
        opacity,
        cursor: 'move',
        '&:hover': {
          backgroundColor: '#f1f1f1',
        },
      }}
    >
      <td>
        <Typography
          component="span"
          color={showPerformanceTimeError(performance, room) ? 'error' : ''}
        >
          {formatTime(performance.time)}
        </Typography>
      </td>
      <td>
        <Typography component="span">{performance.student?.fullName}</Typography>
      </td>
      <td>
        <Typography component="span">
          {performance.student?.auralTestTime && formatTime(performance.student?.auralTestTime)}
        </Typography>
      </td>
      <td>
        <Typography
          component="span"
          color={showPerformanceLevelError(performance, room.levels) ? 'error' : ''}
        >
          {performance.student?.level}
        </Typography>
      </td>
      <td>
        <Typography
          component="span"
          color={showPerformanceRequestError(performance) ? 'error' : ''}
        >
          {performance.student?.request}
        </Typography>
      </td>
      <td>
        {getSiblings(performance.student, students).map((x) => (
          <div key={x.id}>
            {x.fullName} L{x.level} ({formatTime(x.performanceTime)} P,{' '}
            <Typography color={!x.auralTestTime ? 'error' : ''} component="span">
              {formatTime(x.auralTestTime) || 'None'}
            </Typography>{' '}
            A)
          </div>
        ))}
      </td>
      <td>
        {alternateRooms.length > 0 && (
          <PerformanceMenu alternateRooms={alternateRooms} moveRooms={moveRooms} />
        )}
      </td>
    </Box>
  );
};

export default PerformanceRow;
