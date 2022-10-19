import update from 'immutability-helper';
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
import { Dispatch } from 'react';
import { PerformanceRoom, Level, Student } from '../models';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

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

interface Props {
  performanceRooms: PerformanceRoom[];
  setPerformanceRooms: Dispatch<PerformanceRoom[]>;
  levels: Level[];
  students: Student[];
}

const PerformanceRoomForm = ({
  performanceRooms,
  setPerformanceRooms,
  levels,
  students,
}: Props) => {
  if (!students.length) return null;

  const levelOptions = levels.map((x) => x.name);

  const totalMinutesByLevel = levels.map(({ name, timeAllowanceInMinutes }) => ({
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

  const add = () => {
    setPerformanceRooms([
      ...performanceRooms,
      { id: (performanceRooms.length + 1).toString(), levels: [levelOptions[0]], performances: [] },
    ]);
  };

  const remove = () => {
    setPerformanceRooms(performanceRooms.slice(0, performanceRooms.length - 1));
  };

  return (
    <Box my={3}>
      <Typography variant="h6" mb={2}>
        Performance Rooms
      </Typography>
      <Box display="flex">
        {performanceRooms.map((room, i) => (
          <FormControl key={room.id}>
            <InputLabel id="levels">Room {room.id} Levels</InputLabel>
            <Select
              multiple
              id="level"
              labelId="levels"
              value={room.levels}
              onChange={(event) => handleChange(event, i)}
              input={
                <OutlinedInput label={`Room ${room.id} Levels`} sx={{ width: '8rem', mr: 2 }} />
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
        ))}
        <IconButton color="secondary" onClick={add} title="Add Room">
          <AddIcon />
        </IconButton>
        <IconButton color="secondary" onClick={remove} title="Remove Room">
          <RemoveIcon />
        </IconButton>
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

export default PerformanceRoomForm;
