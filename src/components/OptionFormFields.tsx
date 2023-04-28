import { Box, Button, TextField } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers';
import update from 'immutability-helper';
import { useState } from 'react';
import { shallow } from 'zustand/shallow';
import { useAppStore } from '../store/useAppStore';

const OptionFormFields = () => {
  const [showAll, setShowAll] = useState(false);

  const [
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
    afternoonEndTime,
    setAfternoonEndTime,
  ] = useAppStore(
    (state) => [
      state.auralRoomCount,
      state.setAuralRoomCount,
      state.auralTimeAllowance,
      state.setAuralTimeAllowance,
      state.levels,
      state.setLevels,
      state.auralStudentLimit,
      state.setAuralStudentLimit,
      state.timeDifferenceMin,
      state.setTimeDifferenceMin,
      state.timeDifferenceMax,
      state.setTimeDifferenceMax,
      state.siblingStartMax,
      state.setSiblingStartMax,
      state.morningStartTime,
      state.setMorningStartTime,
      state.morningEndTime,
      state.setMorningEndTime,
      state.afternoonStartTime,
      state.setAfternoonStartTime,
      state.afternoonEndTime,
      state.setAfternoonEndTime,
    ],
    shallow
  );

  return (
    <Box flex={1}>
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
        />
        <TimePicker
          label="Morning End Time"
          value={morningEndTime}
          onChange={(val) => val && setMorningEndTime(val)}
        />
        <TimePicker
          label="Afternoon Start Time"
          value={afternoonStartTime}
          onChange={(val) => val && setAfternoonStartTime(val)}
        />
        <TimePicker
          label="Afternoon End Time"
          value={afternoonEndTime}
          onChange={(val) => val && setAfternoonEndTime(val)}
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
      <Button color="secondary" onClick={() => setShowAll(!showAll)} sx={{ mt: 1 }}>
        Show {showAll ? 'Fewer' : 'More'} Options
      </Button>
    </Box>
  );
};

export default OptionFormFields;
