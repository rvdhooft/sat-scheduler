import { Typography } from '@mui/material';
import { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { Student } from '../models';

interface Props {
  student: Student;
  index: number;
  testIndex: number;
  showError: boolean;
}

const AuralTestStudent = ({ student, index, testIndex, showError }: Props) => {
  const ref = useRef<HTMLParagraphElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'aural-test-student',
    item: () => {
      return {
        index,
        id: student.id,
        testIndex,
      };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const opacity = isDragging ? 0 : 1;
  drag(ref);

  return (
    <Typography ref={ref} color={showError ? 'error' : ''} sx={{ opacity, cursor: 'move' }}>
      {student.fullName} ({student.level}, {student.request || 'none'})
    </Typography>
  );
};

export default AuralTestStudent;
