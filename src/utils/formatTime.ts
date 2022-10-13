import { format } from 'date-fns';

const timeFormat = 'h:mm aaa';

function formatTime(date: Date) {
  return format(date, timeFormat);
}

export default formatTime;
