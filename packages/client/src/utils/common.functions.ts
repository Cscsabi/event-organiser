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

export function isSameDay(date1?: Date, date2?: Date) {
  if (!date1 || !date2) {
    return false;
  }

  if (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  ) {
    return true;
  }
  return false;
}

export function capitalize(input: string) {
  return input.charAt(0).toUpperCase() + input.toLowerCase().slice(1);
}

export const getMinTimeFormat = (startDate?: Date, endDate?: Date) => {
  if (!startDate || !endDate) {
    return "";
  }

  if (isSameDay(startDate, endDate)) {
    // Set minimum for end time
    return getProperTimeFormat(startDate);
  }
  return "";
};

export const getMaxTimeFormat = (startDate?: Date, endDate?: Date) => {
  if (!startDate || !endDate) {
    return "";
  }

  if (isSameDay(startDate, endDate)) {
    // Set maximum for start time
    return getProperTimeFormat(endDate);
  }
  return "";
};

export const getDateOrUndefined = (date?: Date) => {
  if (!date) {
    return undefined;
  }
  return new Date(date);
};

export const generateGoogleMapsLink = (
  embed: boolean,
  city?: string,
  state?: string,
  zipCode?: number,
  street?: string
) => {
  return `https://${embed ? "maps." : "www."}google.com/maps?q=${state + "+"}${
    city + "+"
  }${zipCode?.toString() + "+"}${street?.split(" ").join("+")}${
    embed ? "&output=embed" : ""
  }`;
};
