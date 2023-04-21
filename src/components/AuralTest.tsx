import { Box, Typography } from '@mui/material';
import type { Identifier, XYCoord } from 'dnd-core';
import { useRef } from 'react';
import { useDrop } from 'react-dnd';
import { AuralTest } from '../models';
import formatTime from '../utils/formatTime';
import AuralTestStudent from './AuralTestStudent';
import { useAppStore } from '../store/useAppStore';

interface Props {
  test: AuralTest;
  index: number;
  move: (studentId: string, dragTestIndex: number, hoverTestIndex: number) => void;
  commitMove: () => void;
}

interface DragItem {
  index: number;
  testIndex: number;
  id: string;
  type: string;
}

const AuralTestRow = ({ test, index, move, commitMove }: Props) => {
  const ref = useRef<HTMLTableRowElement>(null);
  const auralStudentLimit = useAppStore((state) => state.auralStudentLimit);

  const [, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: 'aural-test-student',
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
      if (item.testIndex === index) {
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
      move(item.id, item.testIndex, index);
      item.testIndex = hoverIndex;
    },
  });
  drop(ref);

  return (
    <Box p={1} mx={-1} sx={index % 2 === 0 ? { background: '#f5f3f3' } : {}}>
      <Box ref={ref} display="flex">
        <Typography pr={2} sx={{ width: '6rem' }}>
          {formatTime(test.time)}
        </Typography>
        <Typography pr={2} sx={{ width: '3.5rem' }}>
          {test.level}
        </Typography>
        <Box sx={{ flexGrow: 1 }}>
          {test.students
            .filter((x) => !!x)
            .map((s, j) => (
              <AuralTestStudent
                studentId={s}
                testIndex={index}
                testLevel={test.level}
                testTime={test.time}
                index={j}
                key={s}
              />
            ))}
        </Box>
      </Box>
      {test.students.length > auralStudentLimit && (
        <Typography color="error">More students than room can hold</Typography>
      )}
    </Box>
  );
};

export default AuralTestRow;
