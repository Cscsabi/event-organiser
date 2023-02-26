import {
  component$,
  useClientEffect$,
  useStore,
} from "@builder.io/qwik";
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
import type { CalendarEvent, ProfilStore } from "~/utils/types";

export default component$(() => {
  const store = useStore<ProfilStore>({
    checkbox: false,
    email: "Loading...",
    date: new Date(),
    events: [],
  });

  const navigate = useNavigate();

  useClientEffect$(async ({ track }) => {
    track(() => store.email);

    const userResponse = await getUser();
    if (!userResponse.data.user) {
      navigate.path = paths.login;
    }

    if (userResponse.data.user?.email) {
      store.email = userResponse.data.user.email;
      const userData = await getUserData(store.email);

      if (userData.user?.notifications) {
        store.checkbox = userData.user?.notifications;
      }
    }

    store.events = await getEvents(store.email);
  });

  return (
    <div>
      <p>Email: {store.email}</p>
      <button onClick$={() => resetPassword(store.email)}>
        Change Password
      </button>
      {/* TODO: check calendar */}
      <QwikCalendar
        client:load
        onChange$={(event: Date) => {
          store.date = event;
        }}
        value={store.date}
        defaultView="year"
        view="month"
        events={store.events}
        onClickDay$={() => {
          console.log("clicked");
        }}
      />
      <label for="emailCheckbox">Enable email reminders:</label>
      <input
        type="checkbox"
        checked={store.checkbox}
        onChange$={(event) => {
          updateUserNotifications(
            store.email,
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
