import { Student } from '../models';
import sortStudents from './sortStudents';

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function generateTestData() {
  const testStudents: Student[] = [];
  let siblings = undefined;
  let siblingRequest = undefined;
  let siblingCount = 0;
  const total = 200;
  for (let i = 0; i < total; i++) {
    const randomRequest = getRandomInt(1, 5);
    const randomLevel = getRandomInt(0, 5);
    if (siblingCount == 0) {
      siblings = undefined;
      siblingRequest = undefined;
    }
    if (siblingCount > 0) {
      siblingCount--;
    } else if (i < total - 2) {
      const randomSiblings = getRandomInt(0, 7);
      if (randomSiblings === 5) {
        siblingCount = getRandomInt(1, 2);
        siblings = `Siblings ${i}`;
        siblingRequest = randomRequest;
      }
    }

    testStudents.push({
      'Student Last Name': 'Student ' + i,
      'Student First Name': 'Test',
      'SAT Level': randomLevel === 0 ? '1a' : randomLevel === 1 ? '1b' : randomLevel.toString(),
      'Scheduling Requests':
        (siblingRequest || randomRequest) === 1
          ? 'AM'
          : (siblingRequest || randomRequest) === 2
          ? 'PM'
          : undefined,
      'Siblings Testing on the Same Day': siblings,
    });
  }
  testStudents.sort(sortStudents(testStudents));
  return testStudents;
}
