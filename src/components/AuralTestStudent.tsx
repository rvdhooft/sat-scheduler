import { Box, Typography } from '@mui/material';
import { isAfter, addHours, isBefore } from 'date-fns';
import { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { useSatParams } from '../contexts/paramContext';
import { useStudents } from '../contexts/studentContext';
import { SchedulingRequest, Student } from '../models';
import formatTime from '../utils/formatTime';
import getSiblings from '../utils/getSiblings';
import { mapRequestToString } from '../utils/studentMappingUtils';

interface Props {
  student: Student;
  index: number;
  testIndex: number;
  testLevel: string | undefined;
  testTime: Date;
}

const AuralTestStudent = ({ student, index, testIndex, testLevel, testTime }: Props) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const { students } = useStudents();
  const { morningStartTime, morningEndTime, afternoonStartTime, afternoonEndTime } = useSatParams();

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

  function showRequestError(student: Student) {
    if (!student) return false;

    if (student.request === SchedulingRequest.AM && isAfter(testTime, morningEndTime)) return true;
    if (
      student.request === SchedulingRequest.EarlyAM &&
      isAfter(testTime, addHours(morningStartTime, 2))
    )
      return true;
    if (
      student.request === SchedulingRequest.LateAM &&
      (isBefore(testTime, addHours(morningEndTime, -2)) || isAfter(testTime, morningEndTime))
    )
      return true;
    if (student.request === SchedulingRequest.PM && isBefore(testTime, afternoonStartTime))
      return true;
    if (
      student.request === SchedulingRequest.EarlyPM &&
      isAfter(testTime, addHours(afternoonStartTime, 2))
    )
      return true;
    if (
      student.request === SchedulingRequest.LatePM &&
      isBefore(testTime, addHours(afternoonEndTime, -2))
    )
      return true;

    return false;
  }

  return (
    <Box
      display="flex"
      ref={ref}
      sx={{
        opacity,
        cursor: 'move',
        '& > *': { pr: 2 },
        '&:hover': {
          backgroundColor: '#efeaea',
          outline: '2px solid #efeaea',
        },
      }}
    >
      <Typography sx={{ width: '10rem' }}>{student.fullName}</Typography>
      <Typography sx={{ width: '10rem' }}>
        {student.performanceTime ? formatTime(student.performanceTime) : ''}
      </Typography>
      <Typography
        sx={{ width: '3.5rem' }}
        color={student.level !== testLevel ? 'error' : 'inherit'}
      >
        {student.level}
      </Typography>
      <Typography sx={{ width: '6rem' }} color={showRequestError(student) ? 'error' : 'inherit'}>
        {mapRequestToString(student.request)}
      </Typography>
      <Typography component="div" sx={{ flex: 1 }}>
        {getSiblings(student, students).map((x) => (
          <div key={x.id}>
            {x.fullName} &mdash; L{x.level} ({formatTime(x.performanceTime)} P,{' '}
            <Typography color={!x.auralTestTime ? 'error' : ''} component="span">
              {formatTime(x.auralTestTime) || 'None'}
            </Typography>{' '}
            A)
          </div>
        ))}
      </Typography>
    </Box>
  );
};

export default AuralTestStudent;
