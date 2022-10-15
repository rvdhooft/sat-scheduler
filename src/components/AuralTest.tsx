import type { Identifier, XYCoord } from 'dnd-core';
import { Box } from '@mui/material';
import { isAfter, isBefore } from 'date-fns';
import { useDrop } from 'react-dnd';
import { AuralTest, Student } from '../models';
import formatTime from '../utils/formatTime';
import AuralTestStudent from './AuralTestStudent';
import { useRef } from 'react';

interface Props {
  test: AuralTest;
  index: number;
  auralStudentLimit: number;
  morningEndTime: Date;
  afternoonStartTime: Date;
  move: (studentName: string, dragTestIndex: number, hoverTestIndex: number) => void;
  commitMove: () => void;
}

interface DragItem {
  index: number;
  testIndex: number;
  studentName: string;
  type: string;
}

const AuralTestRow = ({
  test,
  index,
  auralStudentLimit,
  morningEndTime,
  afternoonStartTime,
  move,
  commitMove,
}: Props) => {
  const ref = useRef<HTMLTableRowElement>(null);

  function showAuralError(student: Student) {
    if (test.level !== student['SAT Level']) {
      return true;
    }
    if (test.students.length > auralStudentLimit) {
      return true;
    }
    if (student['Scheduling Requests'] === 'AM' && isAfter(test.time, morningEndTime)) return true;
    if (student['Scheduling Requests'] === 'PM' && isBefore(test.time, afternoonStartTime))
      return true;

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
      move(item.studentName, item.testIndex, index);
      item.testIndex = hoverIndex;
    },
  });
  drop(ref);

  return (
    <Box ref={ref} component="tr" sx={{ '& td': { padding: '0.25rem 1rem' } }}>
      <td>{formatTime(test.time)}</td>
      <td>{test.level}</td>
      <td>
        <>
          {test.students.map((s, j) => (
            <AuralTestStudent
              student={s}
              testIndex={index}
              index={j}
              key={`${s['Student First Name']} ${s['Student Last Name']}`}
              showError={showAuralError(s)}
            />
          ))}
        </>
      </td>
    </Box>
  );
};

export default AuralTestRow;
