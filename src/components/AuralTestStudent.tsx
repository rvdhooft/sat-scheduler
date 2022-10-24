import { Box, Typography } from '@mui/material';
import { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { Student } from '../models';
import formatTime from '../utils/formatTime';

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
    <Box
      display="flex"
      ref={ref}
      sx={{
        opacity,
        cursor: 'move',
        '& *': { pr: 2 },
        color: (theme) => (showError ? theme.palette.error.main : ''),
        '&:hover': {
          backgroundColor: '#f1f1f1',
        },
      }}
    >
      <Typography sx={{ width: '10rem' }}>{student.fullName}</Typography>
      <Typography sx={{ width: '3.5rem' }}>{student.level}</Typography>
      <Typography sx={{ width: '5rem' }}>{student.request}</Typography>
      <Typography sx={{ width: '8rem' }}>{student.siblings}</Typography>
      <Typography sx={{ width: '10rem' }}>
        {student.performanceTime ? formatTime(student.performanceTime) : ''}
      </Typography>
    </Box>
  );
};

export default AuralTestStudent;
