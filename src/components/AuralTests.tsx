import { Typography, Box } from '@mui/material';
import { isAfter, isBefore } from 'date-fns';
import { AuralTest, Student } from '../models';
import formatTime from '../utils/formatTime';

interface Props {
  auralTests: AuralTest[];
  auralStudentLimit: number;
  morningEndTime: Date;
  afternoonStartTime: Date;
}

const AuralTests = ({
  auralTests,
  auralStudentLimit,
  morningEndTime,
  afternoonStartTime,
}: Props) => {
  function showAuralError(student: Student, test: AuralTest) {
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

  if (!auralTests.length) return null;

  return (
    <Box flex={1}>
      <Typography variant="h6" component="h3">
        Aural Tests
      </Typography>
      <table>
        <tbody>
          {auralTests.map((test, i) => (
            <Box component="tr" key={i} sx={{ '& td': { padding: '0.25rem 1rem' } }}>
              <td>{formatTime(test.time)}</td>
              <td>{test.level}</td>
              <td>
                <>
                  {test.students.map((s, i) => (
                    <Typography key={i} color={showAuralError(s, test) ? 'error' : ''}>
                      {s['Student First Name']} {s['Student Last Name']} ({s['SAT Level']},{' '}
                      {s['Scheduling Requests'] || 'none'})
                    </Typography>
                  ))}
                </>
              </td>
            </Box>
          ))}
        </tbody>
      </table>
    </Box>
  );
};

export default AuralTests;
