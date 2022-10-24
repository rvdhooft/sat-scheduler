import { createContext, Dispatch, useContext, useEffect, useState } from 'react';
import { Student } from '../models';
import { getStudents, saveStudents } from '../utils/localStorage';

interface Context {
  students: Student[];
  setStudents: Dispatch<Student[]>;
}

const StudentContext = createContext<Context>({
  students: [],
  setStudents: () => {
    throw new Error('No context available');
  },
});

export const StudentProvider = ({ children }: { children: any }) => {
  const [students, setStudents] = useState<Student[]>(getStudents() || []);

  useEffect(() => {
    saveStudents(students);
  }, [students]);

  return (
    <StudentContext.Provider value={{ students, setStudents }}>{children}</StudentContext.Provider>
  );
};

export const useStudents = () => useContext(StudentContext);
