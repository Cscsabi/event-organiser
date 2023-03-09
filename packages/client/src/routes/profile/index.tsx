import { component$, useBrowserVisibleTask$, useStore } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { paths } from "~/utils/paths";
import { getUser, getUserData } from "~/utils/supabase.client";
import { QwikCalendar } from "~/integrations/react/calendar";
import { client } from "~/utils/trpc";
import type { CalendarEvent, ProfilStore } from "~/utils/types";
import Toast from "~/components/toast/toast";
import { Status } from "event-organiser-api-server/src/status.enum";

export default component$(() => {
  const store = useStore<ProfilStore>({
    checkbox: false,
    email: "",
    firstname: "",
    lastname: "",
    date: new Date(),
    events: [],
  });

  const navigate = useNavigate();

  useBrowserVisibleTask$(async ({ track }) => {
    track(() => store.email);

    const userResponse = await getUser();
    if (!userResponse.data.user) {
      navigate(paths.login);
    }

    if (userResponse.data.user?.email) {
      store.email = userResponse.data.user.email;
      const userData = await getUserData(store.email);

      if (userData.user) {
        store.checkbox = userData.user.notifications;
        store.firstname = userData.user.firstname;
        store.lastname = userData.user.lastname;
      }
    }

    store.events = await getEvents(store.email);
  });

  return (
    <div>
      <div>
        <label
          for="firstname"
          class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
        >
          Firstname:
        </label>
        <input
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          onInput$={(event) =>
            (store.firstname = (event.target as HTMLInputElement).value)
          }
          type="text"
          value={store.firstname}
        ></input>
      </div>
      <div>
        <label
          for="lastname"
          class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
        >
          Lastname:
        </label>
        <input
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          onInput$={(event) =>
            (store.lastname = (event.target as HTMLInputElement).value)
          }
          type="text"
          value={store.lastname}
        ></input>
      </div>
      <div>
        <label
          for="email"
          class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
        >
          Email:
        </label>
        <input
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          type="email"
          value={store.email}
          readOnly
        ></input>
      </div>
      <div class="mt-6">
        <label
          class="pr-4 mb-2 mt-12 text-sm font-medium text-gray-900 dark:text-white"
          for="emailCheckbox"
        >
          Enable email reminders:
        </label>
        <input
          class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          type="checkbox"
          checked={store.checkbox}
          onChange$={(event) =>
            (store.checkbox = (event.target as HTMLInputElement).checked)
          }
        />
      </div>
      <button
        class="mt-6 mr-2 mb-6 text-white bg-green-700 hover:bg-green-800 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-5 py-2.5 text-centerdark:focus:ring-green-800"
        onClick$={() =>
          save(store).then((result) => {
            if (result.status === Status.SUCCESS) {
              const toast = document.getElementById("successToast");
              if (toast) {
                toast.classList.remove("hidden");
              }
            } else {
              const toast = document.getElementById("failedToast");
              if (toast) {
                toast.classList.remove("hidden");
              }
            }
          })
        }
      >
        Save Changes
      </button>
      <Toast id="successToast" text="TEST" type="success"></Toast>
      <Toast id="failedToast" text="TEST" type="failed"></Toast>
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
      date: event.startDate ?? undefined,
    };

    return calendarEvent;
  });
}

export function save(store: ProfilStore) {
  return client.updateUser.mutate({
    params: { email: store.email },
    body: {
      firstname: store.firstname,
      lastname: store.lastname,
      notifications: store.checkbox,
    },
  });
}
