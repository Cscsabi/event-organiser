/** @jsxImportSource react */
import { qwikify$ } from "@builder.io/qwik-react";
import Calendar from "react-calendar";
import "./calendar.css";
import { isSameDay } from "~/utils/common.functions";
import type { CalendarEvent } from "~/utils/types";

export const QwikCalendar = qwikify$((props: any) => (
  <Calendar
    className={props.className}
    tileContent={({ date, view }) => tileContent(date, view, props.events)}
    onClickDay={(value) => {
      const events: CalendarEvent[] = props.events;
      const filteredEvents = events.filter(({ date }) =>
        isSameDay(date, value)
      );
      if (filteredEvents.length !== 0) {
        // TODO:
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
