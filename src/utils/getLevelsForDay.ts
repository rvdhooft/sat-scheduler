import { AppState } from '../store/types';

function getLevelsForDay(day: number, state: AppState) {
  const levels = (day === 0 ? state.performanceRoomsDay1 : state.performanceRoomsDay2)
    .map((x) => x.levels)
    .flat();
  return [...new Set(levels)]; // get rid of duplicates
}

export default getLevelsForDay;
