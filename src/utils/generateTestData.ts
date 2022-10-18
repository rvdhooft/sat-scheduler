import { Student } from '../models';
import sortStudents from './sortStudents';
import { v4 as uuidv4 } from 'uuid';

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
      id: uuidv4(),
      last: 'Student ' + i,
      first: 'Test',
      fullName: 'Test Student ' + i,
      level: randomLevel === 0 ? '1a' : randomLevel === 1 ? '1b' : randomLevel.toString(),
      request:
        (siblingRequest || randomRequest) === 1
          ? 'AM'
          : (siblingRequest || randomRequest) === 2
          ? 'PM'
          : undefined,
      siblings: siblings,
    });
  }
  testStudents.sort(sortStudents(testStudents));
  return testStudents;
}
