import type { Identifier, XYCoord } from 'dnd-core';
import { Box, Typography } from '@mui/material';
import { isAfter, isBefore } from 'date-fns';
import { useDrop } from 'react-dnd';
import { AuralTest, Student } from '../models';
import formatTime from '../utils/formatTime';
import AuralTestStudent from './AuralTestStudent';
import { useRef } from 'react';
import { useSatParams } from '../contexts/paramContext';

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
  const { morningEndTime, afternoonStartTime, auralStudentLimit } = useSatParams();

  function showAuralError(student: Student) {
    if (test.level !== student.level) {
      return true;
    }
    if (test.students.length > auralStudentLimit) {
      return true;
    }
    if (student.request === 'AM' && isAfter(test.time, morningEndTime)) return true;
    if (student.request === 'PM' && isBefore(test.time, afternoonStartTime)) return true;

    return false;
  }

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
    <Box ref={ref} display="flex" py={1}>
      <Typography pr={2} sx={{ width: '6rem' }}>
        {formatTime(test.time)}
      </Typography>
      <Typography pr={2} sx={{ width: '3.5rem' }}>
        {test.level}
      </Typography>
      <Box sx={{ flexGrow: 1 }}>
        {test.students.map((s, j) => (
          <AuralTestStudent
            student={s}
            testIndex={index}
            index={j}
            key={s.id}
            showError={showAuralError(s)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default AuralTestRow;
