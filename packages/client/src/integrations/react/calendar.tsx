/** @jsxImportSource react */
import { qwikify$ } from "@builder.io/qwik-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import type { CalendarEvent } from "~/types";

export const QwikCalendar = qwikify$((props: any) => (
  <Calendar
    tileContent={({ date, view }) => tileContent(date, view, props.events)}
    onClickDay={(value) => {
      const events: CalendarEvent[] = props.events;
      const filteredEvents = events.filter(({ date }) =>
        isSameDay(date, value)
      );
      if (filteredEvents.length !== 0) {
        // TODO:
        console.log(filteredEvents);
        console.log(value);
      }
    }}
  />
));

export const tileContent = (
  givenDate: Date,
  view: string,
  eventDates: CalendarEvent[]
) => {
  if (view === "month") {
    const events = eventDates.filter(({ date }) => isSameDay(date, givenDate));
    if (events.length !== 0) {
      return <div>{events.map((event) => event.name)}</div>;
    }
  }

  return null;
};

export function isSameDay(date1: Date, date2: Date) {
  if (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  ) {
    return true;
  }
  return false;
}
