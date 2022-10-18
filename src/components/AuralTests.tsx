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
      <Typography variant="h6" component="h3">
        Aural Tests
      </Typography>
      <table>
        <tbody>
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
        </tbody>
      </table>
    </Box>
  );
};

export default AuralTests;
