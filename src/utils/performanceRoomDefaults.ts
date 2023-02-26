import { addMinutes } from 'date-fns';

function getDefaults(i: number) {
  return {
    performances: [],
    morningEndTime: addMinutes(new Date('2023-01-01T11:30:00'), (i - 1) * 10),
    afternoonStartTime: addMinutes(new Date('2023-01-01T12:30:00'), (i - 1) * 10),
  };
}

export function createDefaultPerformanceRoomsDay1() {
  return [
    { id: '1', levels: ['1a'], ...getDefaults(1) },
    { id: '2', levels: ['1b'], ...getDefaults(2) },
    { id: '3', levels: ['2'], ...getDefaults(3) },
    { id: '4', levels: ['3'], ...getDefaults(4) },
    { id: '5', levels: ['4'], ...getDefaults(5) },
    { id: '6', levels: ['5'], ...getDefaults(6) },
  ];
}

export function createDefaultPerformanceRoomsDay2() {
  return [
    { id: '1', levels: ['6'], ...getDefaults(1) },
    { id: '2', levels: ['7'], ...getDefaults(2) },
    { id: '3', levels: ['8'], ...getDefaults(3) },
    { id: '4', levels: ['9'], ...getDefaults(4) },
    { id: '5', levels: ['10'], ...getDefaults(5) },
    { id: '6', levels: ['11', '12'], ...getDefaults(6) },
  ];
}
