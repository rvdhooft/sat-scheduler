import { Box, Typography } from '@mui/material';
import { compareAsc, isAfter, isBefore, isEqual } from 'date-fns';
import { PerformanceRoom, SatPerformance } from '../models';
import formatTime from '../utils/formatTime';

interface Props {
  performanceRooms: PerformanceRoom[];
  morningEndTime: Date;
  afternoonStartTime: Date;
}

const Performances = ({ performanceRooms, morningEndTime, afternoonStartTime }: Props) => {
  function showPerformanceLevelError(p: SatPerformance, roomLevel: string) {
    if (p.student['SAT Level'] !== roomLevel) return true;
  }

  function showPerformanceRequestError(p: SatPerformance) {
    if (p.student['Scheduling Requests'] === 'AM' && isAfter(p.time, morningEndTime)) return true;
    if (p.student['Scheduling Requests'] === 'PM' && isBefore(p.time, afternoonStartTime))
      return true;

    return false;
  }

  function showPerformanceTimeError(p: SatPerformance, room: PerformanceRoom) {
    if (room.performances.filter((x) => isEqual(x.time, p.time)).length > 1) return true;
  }

  if (!performanceRooms.length) return null;

  return (
    <Box flex={1}>
      <Typography variant="h6" component="h3">
        Performances
      </Typography>
      <Box>
        {performanceRooms.map((room, i) => (
          <Box key={i} mt={4}>
            <Typography variant="h6" component="h3">
              {room.level}
            </Typography>
            <table>
              <tbody>
                {room.performances
                  .sort((a, b) => compareAsc(a.time, b.time))
                  .map((p, i) => (
                    <Box component="tr" key={i} sx={{ '& td': { padding: '0.25rem 1rem' } }}>
                      <td>
                        <Typography
                          component="span"
                          color={showPerformanceTimeError(p, room) ? 'error' : ''}
                        >
                          {formatTime(p.time)}
                        </Typography>
                      </td>
                      <td>
                        <Typography component="span">
                          {p.student?.['Student First Name']} {p.student['Student Last Name']}
                        </Typography>
                      </td>
                      <td>
                        <Typography
                          component="span"
                          color={showPerformanceLevelError(p, room.level) ? 'error' : ''}
                        >
                          {p.student?.['SAT Level']}
                        </Typography>
                      </td>
                      <td>
                        <Typography
                          component="span"
                          color={showPerformanceRequestError(p) ? 'error' : ''}
                        >
                          {p.student?.['Scheduling Requests']}
                        </Typography>
                      </td>
                    </Box>
                  ))}
              </tbody>
            </table>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Performances;
