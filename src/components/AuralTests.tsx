import { Typography, Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { AuralTest } from '../models';
import AuralTestRow from './AuralTest';
import update from 'immutability-helper';

interface Props {
  auralTests: AuralTest[];
  auralStudentLimit: number;
  morningEndTime: Date;
  afternoonStartTime: Date;
  updateAuralTests: (tests: AuralTest[]) => void;
}

const AuralTests = ({
  auralTests,
  auralStudentLimit,
  morningEndTime,
  afternoonStartTime,
  updateAuralTests,
}: Props) => {
  const [tests, setTests] = useState<AuralTest[]>(auralTests);

  useEffect(() => {
    setTests(auralTests);
  }, [auralTests]);

  if (!auralTests.length) return null;

  const move = (studentId: string, dragTestIndex: number, hoverTestIndex: number) => {
    const studentIndex = tests[dragTestIndex].students.findIndex((x) => studentId === x.id);
    setTests(
      update(tests, {
        [hoverTestIndex]: {
          students: { $push: [tests[dragTestIndex].students[studentIndex]] },
        },
        [dragTestIndex]: {
          students: { $splice: [[studentIndex, 1]] },
        },
      })
    );
  };

  return (
    <Box flex={1}>
      <Typography variant="h5" component="h3" mb={2}>
        Aural Tests
      </Typography>
      <Box display="flex" sx={{ '& *': { pr: 2, fontWeight: 'bold' } }}>
        <Typography sx={{ width: '6rem' }}>Time</Typography>
        <Typography sx={{ width: '3.5rem' }}>Level</Typography>
        <Typography sx={{ width: '10rem' }}>Student</Typography>
        <Typography sx={{ width: '3.5rem' }}>Level</Typography>
        <Typography sx={{ width: '5rem' }}>Request</Typography>
        <Typography sx={{ width: '8rem' }}>Siblings</Typography>
        <Typography sx={{ width: '10rem' }}>Performance Time</Typography>
      </Box>
      {tests.map((test, i) => (
        <AuralTestRow
          key={i}
          test={test}
          index={i}
          auralStudentLimit={auralStudentLimit}
          morningEndTime={morningEndTime}
          afternoonStartTime={afternoonStartTime}
          move={move}
          commitMove={() => updateAuralTests(tests)}
        />
      ))}
    </Box>
  );
};

export default AuralTests;
