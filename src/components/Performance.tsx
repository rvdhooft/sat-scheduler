import { Box, Typography } from '@mui/material';
import { addHours, differenceInMinutes, isAfter, isBefore, isEqual } from 'date-fns';
import type { Identifier, XYCoord } from 'dnd-core';
import { memo, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { PerformanceRoom, SatPerformance, SchedulingRequest } from '../models';
import { useAppStore } from '../store/useAppStore';
import formatTime from '../utils/formatTime';
import getSiblings from '../utils/getSiblings';
import isTimeDifferenceInRange from '../utils/isTimeDifferenceInRange';
import { mapRequestToString } from '../utils/studentMappingUtils';
import PerformanceMenu from './PerformanceMenu';

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
  const [
    students,
    morningStartTime,
    morningEndTime,
    afternoonEndTime,
    timeDifferenceMin,
    timeDifferenceMax,
  ] = useAppStore((state) => [
    state.students,
    state.morningStartTime,
    state.morningEndTime,
    state.afternoonEndTime,
    state.timeDifferenceMin,
    state.timeDifferenceMax,
  ]);
  const student = students.find((x) => x.id === performance.student);

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

  function showPerformanceLevelError(roomLevels: string[]) {
    if (!roomLevels) return;
    if (!roomLevels.includes(student.level)) return true;
  }

  function showPerformanceRequestError(p: SatPerformance) {
    if (student.request === SchedulingRequest.AM && isAfter(p.time, morningEndTime)) return true;
    if (
      student.request === SchedulingRequest.EarlyAM &&
      isAfter(p.time, addHours(morningStartTime, 2))
    )
      return true;
    if (
      student.request === SchedulingRequest.LateAM &&
      (isBefore(p.time, addHours(morningEndTime, -2)) || isAfter(p.time, morningEndTime))
    )
      return true;
    if (student.request === SchedulingRequest.PM && isBefore(p.time, room.afternoonStartTime))
      return true;
    if (
      student.request === SchedulingRequest.EarlyPM &&
      isAfter(p.time, addHours(room.afternoonStartTime, 2))
    )
      return true;
    if (
      student.request === SchedulingRequest.LatePM &&
      isBefore(p.time, addHours(afternoonEndTime, -2))
    )
      return true;

    return false;
  }

  function showPerformanceTimeError(p: SatPerformance, room: PerformanceRoom) {
    if (room.performances.filter((x) => isEqual(x.time, p.time)).length > 1) return true;
    if (isAfter(p.time, afternoonEndTime)) return true;
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
          backgroundColor: '#efeaea',
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
        <Typography component="span">{student?.fullName}</Typography>
      </td>
      <td>
        {student.auralTestTime ? (
          <Typography
            component="span"
            color={
              !isTimeDifferenceInRange(
                student?.performanceTime,
                student?.auralTestTime,
                timeDifferenceMin,
                timeDifferenceMax
              )
                ? 'error'
                : ''
            }
          >
            {formatTime(student.auralTestTime)} (
            {student.performanceTime &&
              Math.abs(differenceInMinutes(student.auralTestTime, student.performanceTime))}
            m)
          </Typography>
        ) : (
          <Typography color="error">None</Typography>
        )}
      </td>
      <td>
        <Typography component="span" color={showPerformanceLevelError(room.levels) ? 'error' : ''}>
          {student.level}
        </Typography>
      </td>
      <td>
        <Typography
          component="span"
          color={showPerformanceRequestError(performance) ? 'error' : ''}
        >
          {mapRequestToString(student?.request)}
        </Typography>
      </td>
      <td>
        {getSiblings(student, students).map((x) => (
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

export default memo(PerformanceRow);
