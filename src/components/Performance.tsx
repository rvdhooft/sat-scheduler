import type { Identifier, XYCoord } from 'dnd-core';
import { Box, Typography } from '@mui/material';
import { isAfter, isBefore, isEqual } from 'date-fns';
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { PerformanceRoom, SatPerformance } from '../models';
import formatTime from '../utils/formatTime';

interface Props {
  performance: SatPerformance;
  index: number;
  room: PerformanceRoom;
  morningEndTime: Date;
  afternoonStartTime: Date;
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
  morningEndTime,
  afternoonStartTime,
  move,
  commitMove,
}: Props) => {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: `performance-${room.level}`,
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
    type: `performance-${room.level}`,
    item: () => {
      return { index };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  function showPerformanceLevelError(p: SatPerformance, roomLevel: string) {
    if (p.student['SAT Level'] !== roomLevel) return true;
  }

  function showPerformanceRequestError(p: SatPerformance) {
    if (p.student['Scheduling Requests'] === 'AM' && isAfter(p.time, morningEndTime)) return true;
    if (p.student['Scheduling Requests'] === 'PM' && isBefore(p.time, afternoonStartTime))
      return true;

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
      sx={{ '& td': { padding: '0.25rem 1rem' }, opacity, cursor: 'move' }}
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
        <Typography component="span">
          {performance.student?.['Student First Name']} {performance.student['Student Last Name']}
        </Typography>
      </td>
      <td>
        <Typography
          component="span"
          color={showPerformanceLevelError(performance, room.level) ? 'error' : ''}
        >
          {performance.student?.['SAT Level']}
        </Typography>
      </td>
      <td>
        <Typography
          component="span"
          color={showPerformanceRequestError(performance) ? 'error' : ''}
        >
          {performance.student?.['Scheduling Requests']}
        </Typography>
      </td>
    </Box>
  );
};

export default PerformanceRow;
