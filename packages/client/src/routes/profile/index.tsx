import { component$, useBrowserVisibleTask$, useStore } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { paths } from "~/utils/paths";
import {
  changePassword,
  getUser,
  getUserData,
  // test,
} from "~/utils/supabase.client";
import { QwikCalendar } from "~/integrations/react/calendar";
import { client } from "~/utils/trpc";
import type { CalendarEvent, ProfilStore } from "~/utils/types";
import Toast from "~/components/toast/toast";
import { Status } from "event-organiser-api-server/src/status.enum";
import Modal from "~/components/modal/modal";

export default component$(() => {
  const store = useStore<ProfilStore>({
    checkbox: false,
    email: "",
    firstname: "",
    lastname: "",
    newPassword1: "",
    newPassword2: "",
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
      <h1 class="mb-6 text-center text-3xl font-semibold text-black dark:text-white">
        Profile
      </h1>
      <div class="grid gap-6 mb-6 md:grid-cols-2 w-full">
        <div>
          <div>
            <label
              for="firstname"
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
            >
              Firstname:
            </label>
            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
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
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
            >
              Lastname:
            </label>
            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
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
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
            >
              Email:
            </label>
            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
              type="email"
              value={store.email}
              readOnly
            ></input>
          </div>
          <div class="mt-6">
            <label
              class="pr-4 mb-2 mt-12 text-lg font-medium text-gray-900 dark:text-white"
              for="emailCheckbox"
            >
              Enable email reminders:
            </label>
            <input
              class="min-w-4 min-h-4 dark:text-blue-600 bg-gray-300 border-gray-300 rounded dark:focus:ring-blue-500 text-green-800 focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-900 dark:border-gray-600"
              type="checkbox"
              checked={store.checkbox}
              onChange$={(event) =>
                (store.checkbox = (event.target as HTMLInputElement).checked)
              }
            />
          </div>
          <button
            class="mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
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
          <button
            data-modal-target="changePasswordModal"
            data-modal-toggle="changePasswordModal"
            class="mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
            type="button"
          >
            Change Password
          </button>
          {/* <button onClick$={() => test()}></button> */}
          <Modal
            id="changePasswordModal"
            name="Change password"
            size="max-w-xl"
            listType="active-event"
            type=""
          >
            <form
              preventdefault:submit
              onSubmit$={async () => {
                if (store.newPassword1 === store.newPassword2) {
                  document
                    .getElementById("changePasswordFeedback")
                    ?.classList.add("hidden");
                  // const userResponse =
                  await changePassword({
                    email: store.email,
                    password: store.newPassword1,
                  });
                  // if (userResponse.error) {
                  //   console.log("ahh");
                  // } else {
                  //   window.location.reload();
                  // }
                } else {
                  document
                    .getElementById("changePasswordFeedback")
                    ?.classList.remove("hidden");
                }
              }}
            >
              <div>
                <label
                  for="password"
                  class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                >
                  Password:
                </label>
                <input
                  class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
                  onInput$={(event) =>
                    (store.newPassword1 = (
                      event.target as HTMLInputElement
                    ).value)
                  }
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                ></input>
              </div>
              <div>
                <label
                  for="password"
                  class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                >
                  Password again:
                </label>
                <input
                  class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
                  onInput$={(event) =>
                    (store.newPassword2 = (
                      event.target as HTMLInputElement
                    ).value)
                  }
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                ></input>
                <p id="changePasswordFeedback" class="hidden">
                  The passwords are not matching!
                </p>
              </div>
              <button
                type="submit"
                class="mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
              >
                Change
              </button>
            </form>
          </Modal>
        </div>
        <div class="flex place-content-end mt-6">
          <QwikCalendar
            client:visible
            onChange$={(event: Date) => {
              store.date = event;
            }}
            value={store.date}
            defaultView="year"
            view="month"
            events={store.events}
          />
        </div>
      </div>
      <Toast
        id="successToast"
        text="Operation Successful!"
        type="success"
        position="top-right"
      ></Toast>
      <Toast
        id="failedToast"
        text="Operation Failed!"
        type="failed"
        position="top-right"
      ></Toast>
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
