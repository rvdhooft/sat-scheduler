import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import {
  Box,
  Checkbox,
  FormControl,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers';
import update from 'immutability-helper';
import { useAppStore } from '../store/useAppStore';
import formatTime from '../utils/formatTime';
import { memo } from 'react';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};
const FORM_COLUMN_WIDTH = '8.5rem';

const PerformanceRoomForm = () => {
  const performanceRooms = useAppStore((state) => state.getPerformanceRoomsForDay());
  const setPerformanceRooms = useAppStore((state) => state.setPerformanceRooms);
  const levels = useAppStore((state) => state.levels);
  const students = useAppStore((state) => state.students);

  if (!students.length) return null;

  const levelOptions = levels.map((x) => x.name);
  const levelsForDay = levels.filter((x) =>
    performanceRooms
      .map((y) => y.levels)
      .flat()
      .includes(x.name)
  );

  const totalMinutesByLevel = levelsForDay.map(({ name, timeAllowanceInMinutes }) => ({
    level: name,
    minutes: students.filter((x) => x.level === name).length * timeAllowanceInMinutes,
  }));
  const totalMinutes = totalMinutesByLevel.reduce((sum, value) => sum + value.minutes, 0);
  const targetMinutesPerRoom = Math.round(totalMinutes / performanceRooms.length);

  const handleChange = (event: SelectChangeEvent<string[]>, roomIndex: number) => {
    const {
      target: { value },
    } = event;
    // On autofill we get a stringified value.
    const levelArray = typeof value === 'string' ? value.split(',') : value;

    setPerformanceRooms(
      update(performanceRooms, {
        [roomIndex]: {
          levels: { $set: levelArray },
        },
      })
    );
  };

  const handleMorningEndChange = (morningEnd: Date | null, roomIndex: number) => {
    if (!morningEnd) return;

    setPerformanceRooms(
      update(performanceRooms, {
        [roomIndex]: {
          morningEndTime: { $set: morningEnd },
        },
      })
    );
  };

  const handleAfternoonStartChange = (afternoonStart: Date | null, roomIndex: number) => {
    if (!afternoonStart) return;

    setPerformanceRooms(
      update(performanceRooms, {
        [roomIndex]: {
          afternoonStartTime: { $set: afternoonStart },
        },
      })
    );
  };

  const add = () => {
    setPerformanceRooms([
      ...performanceRooms,
      {
        id: (performanceRooms.length + 1).toString(),
        levels: [levelOptions[0]],
        performances: [],
        morningEndTime: new Date('2023-01-01T12:00:00'),
        afternoonStartTime: new Date('2023-01-01T13:00:00'),
      },
    ]);
  };

  const remove = () => {
    setPerformanceRooms(performanceRooms.slice(0, performanceRooms.length - 1));
  };

  return (
    <Box>
      <Typography variant="h5" mb={4}>
        Performance Rooms
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={2}>
        {performanceRooms.map((room, i) => (
          <Box display="flex" flexDirection="column" gap={2} key={room.id}>
            <FormControl>
              <InputLabel id="levels">Room {room.id} Levels</InputLabel>
              <Select
                multiple
                id="level"
                labelId="levels"
                value={room.levels}
                onChange={(event) => handleChange(event, i)}
                input={
                  <OutlinedInput
                    label={`Room ${room.id} Levels`}
                    sx={{ width: FORM_COLUMN_WIDTH }}
                  />
                }
                renderValue={(selected) => selected.join(', ')}
                MenuProps={MenuProps}
              >
                {levelOptions.map((name) => (
                  <MenuItem key={name} value={name}>
                    <Checkbox checked={room.levels.indexOf(name) > -1} />
                    <ListItemText primary={name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TimePicker
              label="Morning End Time"
              value={room.morningEndTime}
              onChange={(val) => handleMorningEndChange(val, i)}
              slotProps={{ textField: { sx: { width: FORM_COLUMN_WIDTH } } }}
            />
            <TimePicker
              label="Afternoon Start Time"
              value={room.afternoonStartTime}
              onChange={(val) => handleAfternoonStartChange(val, i)}
              slotProps={{ textField: { sx: { width: FORM_COLUMN_WIDTH } } }}
            />
            <Typography>
              <Box component="small" display="block" color="#666">
                End of Day
              </Box>
              {room.performances?.length > 0
                ? formatTime(room.performances[room.performances.length - 1].time)
                : '--'}
            </Typography>
          </Box>
        ))}
        <div>
          <IconButton color="secondary" onClick={add} title="Add Room">
            <AddIcon />
          </IconButton>
          <IconButton color="secondary" onClick={remove} title="Remove Room">
            <RemoveIcon />
          </IconButton>
        </div>
      </Box>
      <Box display="flex" alignItems="flex-end" mt={3}>
        <Box mr={7}>
          <Typography mb={1} variant="h6" fontSize="1.125rem">
            Performance Totals by Level
          </Typography>
          <Typography mb={1}>Total Minutes: {totalMinutes}</Typography>
          <Typography>Target Minutes Per Room: {targetMinutesPerRoom}</Typography>
        </Box>
        <Box component="table" sx={{ '& th,td': { px: 1 } }}>
          <thead>
            <tr>
              <th></th>
              {totalMinutesByLevel.map((x) => (
                <th key={x.level}>{x.level}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total Minutes</td>
              {totalMinutesByLevel.map((x) => (
                <td key={x.level}>{x.minutes}</td>
              ))}
            </tr>
            <tr>
              <td>Minutes from Target</td>
              {totalMinutesByLevel.map((x) => (
                <Box
                  component="td"
                  key={x.level}
                  sx={{
                    color: (theme) =>
                      x.minutes - targetMinutesPerRoom > 30
                        ? theme.palette.secondary.main
                        : x.minutes - targetMinutesPerRoom < -30
                        ? theme.palette.primary.main
                        : '',
                  }}
                >
                  {x.minutes > targetMinutesPerRoom && <>+</>}
                  {x.minutes > 0 ? x.minutes - targetMinutesPerRoom : ''}
                </Box>
              ))}
            </tr>
          </tbody>
        </Box>
      </Box>
    </Box>
  );
};

export default memo(PerformanceRoomForm);
