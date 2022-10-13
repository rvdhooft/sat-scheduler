import { Box, Button, TextField } from '@mui/material';
import { Dispatch, useState } from 'react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';

interface Props {
  performanceRoomCount: number;
  setPerformanceRoomCount: Dispatch<number>;
  auralRoomCount: number;
  setAuralRoomCount: Dispatch<number>;
  auralTimeAllowance: number;
  setAuralTimeAllowance: Dispatch<number>;
  performanceTimeAllowance: any;
  setPerformanceTimeAllowance: Dispatch<any>;
  auralStudentLimit: number;
  setAuralStudentLimit: Dispatch<number>;
  timeDifferenceMin: number;
  setTimeDifferenceMin: Dispatch<number>;
  timeDifferenceMax: number;
  setTimeDifferenceMax: Dispatch<number>;
  siblingStartMax: number;
  setSiblingStartMax: Dispatch<number>;
  morningStartTime: Date;
  setMorningStartTime: Dispatch<Date>;
  morningEndTime: Date;
  setMorningEndTime: Dispatch<Date>;
  afternoonStartTime: Date;
  setAfternoonStartTime: Dispatch<Date>;
}

const OptionFormFields = ({
  performanceRoomCount,
  setPerformanceRoomCount,
  auralRoomCount,
  setAuralRoomCount,
  auralTimeAllowance,
  setAuralTimeAllowance,
  performanceTimeAllowance,
  setPerformanceTimeAllowance,
  auralStudentLimit,
  setAuralStudentLimit,
  timeDifferenceMin,
  setTimeDifferenceMin,
  timeDifferenceMax,
  setTimeDifferenceMax,
  siblingStartMax,
  setSiblingStartMax,
  morningStartTime,
  setMorningStartTime,
  morningEndTime,
  setMorningEndTime,
  afternoonStartTime,
  setAfternoonStartTime,
}: Props) => {
  const [showAll, setShowAll] = useState(false);
  return (
    <Box flex={1}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box
          display="flex"
          flexWrap="wrap"
          gap={2}
          sx={{ '& .MuiInputBase-root': { minWidth: '258.8px' } }}
        >
          <TextField
            label="Performance Room Count"
            type="number"
            value={performanceRoomCount}
            onChange={(event) => setPerformanceRoomCount(+event.target.value)}
          />
          <TextField
            label="Aural Test Room Count"
            type="number"
            value={auralRoomCount}
            onChange={(event) => setAuralRoomCount(+event.target.value)}
          />
          <TextField
            label="Aural Test Time Allowance"
            type="number"
            value={auralTimeAllowance}
            onChange={(event) => setAuralTimeAllowance(+event.target.value)}
          />
          <TextField
            label="Aural Test Max Student Count"
            type="number"
            value={auralStudentLimit}
            onChange={(event) => setAuralStudentLimit(+event.target.value)}
          />
          <TextField
            label="Minimum Time Between Tests (min)"
            type="number"
            value={timeDifferenceMin}
            onChange={(event) => setTimeDifferenceMin(+event.target.value)}
          />
          <TextField
            label="Maximum Time Between Tests (min)"
            type="number"
            value={timeDifferenceMax}
            onChange={(event) => setTimeDifferenceMax(+event.target.value)}
          />
          <TimePicker
            label="Morning Start Time"
            value={morningStartTime}
            onChange={(val) => val && setMorningStartTime(val)}
            renderInput={(params) => <TextField {...params} />}
          />
          <TimePicker
            label="Morning End Time"
            value={morningEndTime}
            onChange={(val) => val && setMorningEndTime(val)}
            renderInput={(params) => <TextField {...params} />}
          />
          <TimePicker
            label="Afternoon Start Time"
            value={afternoonStartTime}
            onChange={(val) => val && setAfternoonStartTime(val)}
            renderInput={(params) => <TextField {...params} />}
          />
          {showAll && (
            <>
              <TextField
                label="Sibling Max Start Time Diff (min)"
                type="number"
                value={siblingStartMax}
                onChange={(event) => setSiblingStartMax(+event.target.value)}
              />
              {Object.entries(performanceTimeAllowance).map(([key, value], i) => (
                <TextField
                  type="number"
                  label={`Performance Time Allowance: L${key}`}
                  key={i}
                  value={value}
                  onChange={(event) =>
                    setPerformanceTimeAllowance({
                      ...performanceTimeAllowance,
                      [key]: event.target.value,
                    })
                  }
                />
              ))}
            </>
          )}
        </Box>
      </LocalizationProvider>
      <Button color="secondary" onClick={() => setShowAll(!showAll)} sx={{ mt: 1 }}>
        Show {showAll ? 'Fewer' : 'More'} Options
      </Button>
    </Box>
  );
};

export default OptionFormFields;
