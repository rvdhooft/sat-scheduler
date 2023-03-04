import { createContext, Dispatch, useContext, useEffect, useState } from 'react';
import { Level } from '../models';
import { getParams, saveParams } from '../utils/localStorage';

interface Context {
  auralRoomCount: number;
  setAuralRoomCount: Dispatch<number>;
  auralStudentLimit: number;
  setAuralStudentLimit: Dispatch<number>;
  auralTimeAllowance: number;
  setAuralTimeAllowance: Dispatch<number>;
  levels: Level[];
  setLevels: Dispatch<Level[]>;
  timeDifferenceMin: number;
  setTimeDifferenceMin: Dispatch<number>;
  timeDifferenceMax: number;
  setTimeDifferenceMax: Dispatch<number>;
  siblingStartMax: number;
  setSiblingStartMax: Dispatch<number>;
  morningStartTime: Date;
  setMorningStartTime: Dispatch<Date>;
  morningEndTime: Date;
  setMorningEndTime: Dispatch<Date>;
  afternoonStartTime: Date;
  setAfternoonStartTime: Dispatch<Date>;
  afternoonEndTime: Date;
  setAfternoonEndTime: Dispatch<Date>;
}

const emptyDispatch = () => {
  throw new Error('No context available');
};

const MORNING_START_TIME = new Date('2023-01-01T08:45:00');
const MORNING_END_TIME = new Date('2023-01-01T12:00:00');
const AFTERNOON_START_TIME = new Date('2023-01-01T13:00:00');
const AFTERNOON_END_TIME = new Date('2023-01-01T16:00:00');

const ParamContext = createContext<Context>({
  auralRoomCount: 0,
  setAuralRoomCount: emptyDispatch,
  auralStudentLimit: 0,
  setAuralStudentLimit: emptyDispatch,
  auralTimeAllowance: 0,
  setAuralTimeAllowance: emptyDispatch,
  levels: [],
  setLevels: emptyDispatch,
  timeDifferenceMin: 0,
  setTimeDifferenceMin: emptyDispatch,
  timeDifferenceMax: 0,
  setTimeDifferenceMax: emptyDispatch,
  siblingStartMax: 0,
  setSiblingStartMax: emptyDispatch,
  morningStartTime: MORNING_START_TIME,
  setMorningStartTime: emptyDispatch,
  morningEndTime: MORNING_END_TIME,
  setMorningEndTime: emptyDispatch,
  afternoonStartTime: AFTERNOON_START_TIME,
  setAfternoonStartTime: emptyDispatch,
  afternoonEndTime: AFTERNOON_END_TIME,
  setAfternoonEndTime: emptyDispatch,
});

export const ParamProvider = ({ children }: { children: any }) => {
  const params = getParams() || {};
  const [auralRoomCount, setAuralRoomCount] = useState(params.auralRoomCount || 2);
  const [auralStudentLimit, setAuralStudentLimit] = useState(params.auralStudentLimit || 12);
  const [auralTimeAllowance, setAuralTimeAllowance] = useState(params.auralTimeAllowance || 15);
  const [levels, setLevels] = useState<Level[]>(
    params.levels || [
      { name: '1a', timeAllowanceInMinutes: 9 },
      { name: '1b', timeAllowanceInMinutes: 9 },
      { name: '2', timeAllowanceInMinutes: 9 },
      { name: '3', timeAllowanceInMinutes: 9 },
      { name: '4', timeAllowanceInMinutes: 10 },
      { name: '5', timeAllowanceInMinutes: 10 },
      { name: '6', timeAllowanceInMinutes: 11 },
      { name: '7', timeAllowanceInMinutes: 11 },
      { name: '8', timeAllowanceInMinutes: 14 },
      { name: '9', timeAllowanceInMinutes: 14 },
      { name: '10', timeAllowanceInMinutes: 17 },
      { name: '11', timeAllowanceInMinutes: 17 },
      { name: '12', timeAllowanceInMinutes: 17 },
    ]
  );
  const [timeDifferenceMin, setTimeDifferenceMin] = useState(params.timeDifferenceMin || 20);
  const [timeDifferenceMax, setTimeDifferenceMax] = useState(params.timeDifferenceMax || 60);
  const [siblingStartMax, setSiblingStartMax] = useState(params.siblingStartMax || 20);
  const [morningStartTime, setMorningStartTime] = useState(
    params.morningStartTime || MORNING_START_TIME
  );
  const [morningEndTime, setMorningEndTime] = useState(params.morningEndTime || MORNING_END_TIME);
  const [afternoonStartTime, setAfternoonStartTime] = useState(
    params.afternoonStartTime || AFTERNOON_START_TIME
  );
  const [afternoonEndTime, setAfternoonEndTime] = useState(
    params.afternoonEndTime || AFTERNOON_END_TIME
  );

  useEffect(() => {
    saveParams({
      auralRoomCount,
      auralStudentLimit,
      auralTimeAllowance,
      levels,
      timeDifferenceMin,
      timeDifferenceMax,
      siblingStartMax,
      morningStartTime,
      morningEndTime,
      afternoonStartTime,
      afternoonEndTime,
    });
  }, [
    auralRoomCount,
    auralStudentLimit,
    auralTimeAllowance,
    levels,
    timeDifferenceMin,
    timeDifferenceMax,
    siblingStartMax,
    morningStartTime,
    morningEndTime,
    afternoonStartTime,
    afternoonEndTime,
  ]);

  return (
    <ParamContext.Provider
      value={{
        auralRoomCount,
        setAuralRoomCount,
        auralStudentLimit,
        setAuralStudentLimit,
        auralTimeAllowance,
        setAuralTimeAllowance,
        levels,
        setLevels,
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
      }}
    >
      {children}
    </ParamContext.Provider>
  );
};

export const useSatParams = () => useContext(ParamContext);
