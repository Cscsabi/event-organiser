import { component$, useSignal, useClientEffect$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import type { UserResponse } from "@supabase/supabase-js";
import { paths } from "~/utils/paths";
import {
  getUser,
  getUserData,
  resetPassword,
  updateUserNotifications,
} from "~/utils/supabase.client";
import { QwikCalendar } from "~/integrations/react/calendar";
import { client } from "~/utils/trpc";

export default component$(() => {
  const checkbox = useSignal(false);
  const email = useSignal("Loading...");
  const input = useSignal<EventTarget & HTMLInputElement>();
  const date = useSignal<Date>(new Date());
  const navigate = useNavigate();
  const datesToAddContentTo = useSignal<Date[] | undefined>();

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

    datesToAddContentTo.value = await getDatesToAddContentTo();
  });

  return (
    <div>
      <p>Email: {email.value}</p>
      <button onClick$={() => resetPassword(email.value)}>
        Change Password
      </button>
      // TODO: check calendar
      <QwikCalendar
        client:load
        onChange$={(event: Date) => {
          console.log(date.value);

          date.value = event;
          console.log(date.value);
        }}
        value={date.value}
        defaultView="year"
        view="month"
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

export async function tileContent(
  date: Date,
  view: string,
  datesToAddContentTo: Date[] | undefined
) {
  if (view === "month") {
    if (datesToAddContentTo?.find((dDate) => isSameDay(dDate, date))) {
      return "My content";
    }
  }
  return "";
}

export async function getDatesToAddContentTo() {
  const userResponse = await getUser();
  if (userResponse.data.user?.email) {
    const result = await client.getEvents.query({
      email: userResponse.data.user.email,
    });

    return result.events.map((event) => {
      return event.date;
    });
  }
}

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

// tileContent={async ({ date, view }) => {
//   return await tileContent(date, view);
// }}
