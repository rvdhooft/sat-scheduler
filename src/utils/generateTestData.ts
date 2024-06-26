import { SchedulingRequest, Student } from '../models';
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
  let siblingLevelMin = undefined;
  let siblingLevelMax = undefined;
  const total = 300;
  for (let i = 0; i < total; i++) {
    const randomRequest = getRandomInt(1, 12);
    let randomLevel = getRandomInt(siblingLevelMin || 0, siblingLevelMax || 12);
    // Have fewer 11s & 12s
    if (randomLevel > 10) {
      if (i % 3 === 0) {
        randomLevel = 6;
      } else if (i % 3 === 1) {
        randomLevel = 7;
      }
    }
    if (siblingCount == 0) {
      siblings = undefined;
      siblingRequest = undefined;
      siblingLevelMin = undefined;
      siblingLevelMax = undefined;
    }
    if (siblingCount > 0) {
      siblingCount--;
    } else if (i < total - 2) {
      const randomSiblings = getRandomInt(0, 7);
      if (randomSiblings === 5) {
        siblingCount = getRandomInt(1, 2);
        siblings = `Siblings ${i}`;
        siblingRequest = randomRequest;
        siblingLevelMin = randomLevel < 6 ? 0 : 6;
        siblingLevelMax = randomLevel < 6 ? 5 : 12;
      }
    }

    testStudents.push({
      id: uuidv4(),
      last: 'Student ' + i,
      first: 'Test',
      fullName: 'Test Student ' + i,
      level: randomLevel === 0 ? '1a' : randomLevel === 1 ? '1b' : randomLevel.toString(),
      request:
        (siblingRequest || randomRequest) <= 6
          ? ((siblingRequest || randomRequest) as SchedulingRequest)
          : undefined,
      siblings: siblings,
    });
  }
  testStudents.sort(sortStudents(testStudents));
  return testStudents;
}
