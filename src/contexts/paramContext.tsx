import { createContext, Dispatch, useContext, useState } from 'react';
import { Level } from '../models';

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
  morningStartTime: new Date(),
  setMorningStartTime: emptyDispatch,
  morningEndTime: new Date(),
  setMorningEndTime: emptyDispatch,
  afternoonStartTime: new Date(),
  setAfternoonStartTime: emptyDispatch,
  afternoonEndTime: new Date(),
  setAfternoonEndTime: emptyDispatch,
});

export const ParamProvider = ({ children }: { children: any }) => {
  const [auralRoomCount, setAuralRoomCount] = useState(2);
  const [auralStudentLimit, setAuralStudentLimit] = useState(12);
  const [auralTimeAllowance, setAuralTimeAllowance] = useState(15);
  const [levels, setLevels] = useState<Level[]>([
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
  ]);
  const [timeDifferenceMin, setTimeDifferenceMin] = useState(20);
  const [timeDifferenceMax, setTimeDifferenceMax] = useState(60);
  const [siblingStartMax, setSiblingStartMax] = useState(20);
  const [morningStartTime, setMorningStartTime] = useState(new Date('2023-01-01T08:30:00'));
  const [morningEndTime, setMorningEndTime] = useState(new Date('2023-01-01T12:00:00'));
  const [afternoonStartTime, setAfternoonStartTime] = useState(new Date('2023-01-01T13:00:00'));
  const [afternoonEndTime, setAfternoonEndTime] = useState(new Date('2023-01-01T18:00:00'));

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
