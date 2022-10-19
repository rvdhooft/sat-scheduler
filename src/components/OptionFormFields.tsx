import update from 'immutability-helper';
import { Box, Button, TextField } from '@mui/material';
import { Dispatch, useState } from 'react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { Level } from '../models';

interface Props {
  auralRoomCount: number;
  setAuralRoomCount: Dispatch<number>;
  auralTimeAllowance: number;
  setAuralTimeAllowance: Dispatch<number>;
  levels: Level[];
  setLevels: Dispatch<Level[]>;
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
  auralRoomCount,
  setAuralRoomCount,
  auralTimeAllowance,
  setAuralTimeAllowance,
  levels,
  setLevels,
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
          <TextField
            label="Sibling Max Start Time Diff (min)"
            type="number"
            value={siblingStartMax}
            onChange={(event) => setSiblingStartMax(+event.target.value)}
          />
          {showAll && (
            <>
              {levels.map((level, i) => (
                <TextField
                  type="number"
                  label={`Performance Time Allowance: L${level.name}`}
                  key={i}
                  value={level.timeAllowanceInMinutes}
                  onChange={(event) =>
                    setLevels(
                      update(levels, {
                        [i]: { timeAllowanceInMinutes: { $set: +event.target.value } },
                      })
                    )
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
