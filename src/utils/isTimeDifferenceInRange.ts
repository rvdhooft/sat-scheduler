import { differenceInMinutes } from 'date-fns';

function isTimeDifferenceInRange(
  time1: Date | undefined,
  time2: Date | undefined,
  min: number,
  max: number
) {
  if (!time1 || !time2) return false;
  const difference = Math.abs(differenceInMinutes(time1, time2));
  return difference >= min && difference <= max;
}

export default isTimeDifferenceInRange;
