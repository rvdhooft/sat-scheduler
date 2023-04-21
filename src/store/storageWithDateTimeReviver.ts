import { createJSONStorage } from 'zustand/middleware';

const dateTimeReviver = function (key: string, value: string) {
  if (key.toLowerCase().endsWith('time')) {
    return new Date(value);
  }
  return value;
};

function getFromJsonByKey(key: string) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data, dateTimeReviver) : null;
}

const storageWithDateTimeReviver = {
  ...createJSONStorage(() => localStorage),
  getItem: getFromJsonByKey,
};

export default storageWithDateTimeReviver;
