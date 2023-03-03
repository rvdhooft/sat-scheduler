import { Typography, Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { AuralTest } from '../models';
import AuralTestRow from './AuralTest';
import update from 'immutability-helper';

interface Props {
  auralTests: AuralTest[];
  updateAuralTests: (tests: AuralTest[]) => void;
}

const AuralTests = ({ auralTests, updateAuralTests }: Props) => {
  const [tests, setTests] = useState<AuralTest[]>(auralTests);
  const testStudents = tests
    .map((x) => x.students)
    .flat()
    .reduce((result: any, b) => {
      result[b.fullName] = (result[b.fullName] || 0) + 1;
      return result;
    }, {});
  const duplicates = Object.keys(testStudents).filter((a) => testStudents[a] > 1);

  useEffect(() => {
    setTests(auralTests);
  }, [auralTests]);

  if (!auralTests.length) return null;

  const move = (studentId: string, dragTestIndex: number, hoverTestIndex: number) => {
    setTests((prev) => {
      const studentIndex = prev[dragTestIndex].students.findIndex((x) => studentId === x.id);
      return update(prev, {
        [hoverTestIndex]: {
          students: { $push: [prev[dragTestIndex].students[studentIndex]] },
        },
        [dragTestIndex]: {
          students: { $splice: [[studentIndex, 1]] },
        },
      });
    });
  };

  return (
    <Box flex={1}>
      <Typography variant="h5" component="h3" mb={2}>
        Aural Tests
      </Typography>

      {duplicates.length > 0 && (
        <Typography color="error" mb={2}>
          <strong>Duplicates Found:</strong>
          <br /> {duplicates.join(', ')}
        </Typography>
      )}

      <Box display="flex" p={1} sx={{ '& *': { pr: 2, fontWeight: 'bold' } }}>
        <Typography sx={{ width: '6rem' }}>Time</Typography>
        <Typography sx={{ width: '3.5rem' }}>Level</Typography>
        <Typography sx={{ width: '10rem' }}>Student</Typography>
        <Typography sx={{ width: '10rem' }}>Performance Time</Typography>
        <Typography sx={{ width: '3.5rem' }}>Level</Typography>
        <Typography sx={{ width: '6rem' }}>Request</Typography>
        <Typography sx={{ width: '24rem' }}>Siblings</Typography>
      </Box>
      {tests.map((test, i) => (
        <AuralTestRow
          key={i}
          test={test}
          index={i}
          move={move}
          commitMove={() => updateAuralTests(tests)}
        />
      ))}
    </Box>
  );
};

export default AuralTests;
