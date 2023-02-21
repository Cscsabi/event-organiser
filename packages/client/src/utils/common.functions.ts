export const getProperDateFormat = (date?: Date) => {
  let usedDate = date;
  if (!usedDate) {
    usedDate = new Date();
  }
  return usedDate
    .toISOString()
    .replace(/:\d{2}\.\d{3}Z$/, "")
    .substring(0, 10);
};

export const getProperTimeFormat = (time?: Date) => {
  let usedTime = time;
  if (!usedTime) {
    usedTime = new Date();
  }

  return usedTime
    .toISOString()
    .replace(/:\d{2}\.\d{3}Z$/, "")
    .substring(11);
};

export function capitalize(input: string) {
  return input.charAt(0).toUpperCase() + input.toLowerCase().slice(1);
}
