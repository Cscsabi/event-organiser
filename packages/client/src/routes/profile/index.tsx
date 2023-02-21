import { component$, useSignal, useClientEffect$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { paths } from "~/utils/paths";
import {
  getUser,
  getUserData,
  resetPassword,
  updateUserNotifications,
} from "~/utils/supabase.client";
import { QwikCalendar } from "~/integrations/react/calendar";
import { client } from "~/utils/trpc";
import type { CalendarEvent } from "~/types";
export default component$(() => {
  const checkbox = useSignal(false);
  const email = useSignal("Loading...");
  const input = useSignal<EventTarget & HTMLInputElement>();
  const date = useSignal<Date>(new Date());
  const navigate = useNavigate();
  const events = useSignal<CalendarEvent[]>([]);

  useClientEffect$(async ({ track }) => {
    track(() => email.value);
    track(() => input.value);

    const userResponse = await getUser();
    if (!userResponse.data.user) {
      navigate.path = paths.login;
    }

    if (userResponse.data.user?.email) {
      email.value = userResponse.data.user.email;
      const userData = await getUserData(email.value);

      if (userData.user?.notifications) {
        checkbox.value = userData.user?.notifications;
      }
    }

    events.value = await getEvents(email.value);
  });

  return (
    <div>
      <p>Email: {email.value}</p>
      <button onClick$={() => resetPassword(email.value)}>
        Change Password
      </button>
      {/* TODO: check calendar */}
      <QwikCalendar
        client:load
        onChange$={(event: Date) => {
          date.value = event;
        }}
        value={date.value}
        defaultView="year"
        view="month"
        events={events.value}
        onClickDay$={() => {
          console.log("clicked");
        }}
      />
      <label for="emailCheckbox">Enable email reminders:</label>
      <input
        type="checkbox"
        checked={checkbox.value}
        onChange$={(event) => {
          updateUserNotifications(
            email.value,
            (event.target as HTMLInputElement).checked
          );
        }}
      />
    </div>
  );
});

export async function getEvents(email: string) {
  const result = await client.getEvents.query({
    email: email,
  });

  return result.events.map((event) => {
    const calendarEvent: CalendarEvent = {
      name: event.name,
      date: event.startDate,
    };

    return calendarEvent;
  });
}
