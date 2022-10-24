import { Typography, Box } from '@mui/material';
import { compareAsc, differenceInMinutes, isBefore } from 'date-fns';
import { Student } from '../models';
import formatTime from '../utils/formatTime';
import getSiblings from '../utils/getSiblings';

interface Props {
  students: Student[];
  hasSchedule: boolean;
  siblingStartMax: number;
  timeDifferenceMin: number;
  timeDifferenceMax: number;
}

const Students = ({
  students,
  hasSchedule,
  siblingStartMax,
  timeDifferenceMin,
  timeDifferenceMax,
}: Props) => {
  if (!students.length) return <Typography>None</Typography>;

  function showSiblingStartTimeDiffError(student: Student) {
    const diff = getSiblingStartDiffMax(student);
    return diff && diff > siblingStartMax;
  }

  function showIndividualTimeDiffError(student: Student) {
    if (!student.auralTestTime || !student.performanceTime) return false;
    const timeDiff = Math.abs(differenceInMinutes(student.auralTestTime, student.performanceTime));

    // Time between aural & performance must be between min and max
    if (timeDiff < timeDifferenceMin || timeDiff > timeDifferenceMax) return true;
  }

  function getSiblingStartDiffMax(student: Student) {
    if (!student.siblings || !student.performanceTime || !student.auralTestTime) return null;

    const startTime = isBefore(student.auralTestTime, student.performanceTime)
      ? student.auralTestTime
      : student.performanceTime;
    const siblings = getSiblings(student, students);
    const siblingStartTimes = siblings
      .filter((sib) => sib.auralTestTime && sib.performanceTime)
      .map((sib) =>
        isBefore(sib.auralTestTime!, sib.performanceTime!) ? sib.auralTestTime : sib.performanceTime
      );
    if (!siblingStartTimes.length) return null;

    const allTimesSorted = [startTime, ...siblingStartTimes].sort((a, b) => compareAsc(a!, b!));
    return Math.abs(
      differenceInMinutes(allTimesSorted[0]!, allTimesSorted[allTimesSorted.length - 1]!)
    );
  }

  return (
    <>
      <Box display="flex" alignItems="flex-end" gap={3}>
        <Typography variant="h5">Students</Typography>

        <Typography>Total: {students.length}</Typography>
        <Typography color={students.filter((x) => !x.performanceTime).length ? 'error' : ''}>
          Total w/o Performance Time: {students.filter((x) => !x.performanceTime).length}
        </Typography>
        <Typography color={students.filter((x) => !x.auralTestTime).length ? 'error' : ''}>
          Total w/o Aural Test Time: {students.filter((x) => !x.auralTestTime).length}
        </Typography>
      </Box>
      <table>
        <Box component="thead" sx={{ '& th': { textAlign: 'left', padding: '0.25rem 1rem' } }}>
          <tr>
            <th>Name</th>
            <th>Level</th>
            <th>Request</th>
            <th>Siblings</th>
            <th>Performance</th>
            <th>Aural</th>
            <th>Time Diff (min)</th>
            <th style={{ maxWidth: '10rem' }}>Max Sibling Start Time Diff (min)</th>
          </tr>
        </Box>
        <tbody>
          {students.map((student, i) => (
            <Box component="tr" key={i} sx={{ '& td': { padding: '0.25rem 1rem' } }}>
              <td>{student.fullName}</td>
              <td>{student.level}</td>
              <td>{student.request}</td>
              <td>{student.siblings}</td>
              {hasSchedule && (
                <>
                  <td>
                    {student.performanceTime ? (
                      <Typography>{formatTime(student.performanceTime)}</Typography>
                    ) : (
                      <Typography color="error">None</Typography>
                    )}
                  </td>
                  <td>
                    {student.auralTestTime ? (
                      <Typography>{formatTime(student.auralTestTime)}</Typography>
                    ) : (
                      <Typography color="error">None</Typography>
                    )}
                  </td>
                  <td>
                    {student.auralTestTime && student.performanceTime && (
                      <Typography color={showIndividualTimeDiffError(student) ? 'error' : ''}>
                        {differenceInMinutes(student.auralTestTime, student.performanceTime)}
                      </Typography>
                    )}
                  </td>
                  <td>
                    <Typography color={showSiblingStartTimeDiffError(student) ? 'error' : ''}>
                      {getSiblingStartDiffMax(student)}
                    </Typography>
                  </td>
                </>
              )}
            </Box>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default Students;
