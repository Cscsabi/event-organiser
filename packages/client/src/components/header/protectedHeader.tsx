import {
  component$,
  useBrowserVisibleTask$,
  useContext,
  useSignal,
} from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { paths } from "~/utils/paths";
import { logoutUser } from "~/utils/supabase.client";
import { CTX } from "~/routes/layout";
import { Status } from "event-organiser-api-server/src/status.enum";
import { client } from "~/utils/trpc";

export const ProtectedHeader = component$(() => {
  const darkMode = useSignal<boolean>();
  const user = useContext(CTX);
  const navigate = useNavigate();

  useBrowserVisibleTask$(async ({ track }) => {
    track(() => darkMode.value);
    const rootTag = document.getElementsByTagName("html")[0];

    if (darkMode.value === undefined) {
      const result = await client.getUser.query({
        email: user.value,
      });

      darkMode.value = result.user?.darkModeEnabled ? true : false;
    }

    if (darkMode.value && !rootTag.classList.contains("dark")) {
      rootTag.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else if (!darkMode.value && rootTag.classList.contains("dark")) {
      rootTag.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  });

  return (
    <nav class="px-2 bg-green-200 border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div class="container flex flex-wrap items-center justify-between mx-auto">
        <ul class="flex flex-col p-4 mt-4 border border-gray-100 rounded-lg bg-green-200 md:flex-row md:space-x-8 md:mt-0 md:text-md md:font-medium md:border-0 md:bg-green-200 dark:bg-gray-800 md:dark:bg-gray-800 dark:border-gray-700">
          <li>
            <a
              class="flex items-center justify-between w-full py-2 pl-3 pr-4 font-semibold text-black rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-green-700 md:p-0 md:w-auto dark:font-semibold dark:text-white dark:hover:text-indigo-400 dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
              href={paths.index}
            >
              <button>
                <i class="fa-solid fa-house"></i> Home
              </button>
            </a>
          </li>
          <li>
            <div class="flex items-center justify-between w-full py-2 pl-3 pr-4 font-semibold text-black rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-green-700 md:p-0 md:w-auto dark:font-semibold dark:text-white dark:hover:text-indigo-400 dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent">
              <button
                type="button"
                onClick$={() => {
                  darkMode.value = !darkMode.value;
                  client.updateUser.mutate({
                    params: { email: user.value },
                    body: {
                      darkModeEnabled: darkMode.value,
                    },
                  });
                }}
              >
                {!darkMode.value ? (
                  <div>
                    <i class="fa-regular fa-moon "></i> Dark mode
                  </div>
                ) : (
                  <div>
                    <i class="fa-regular fa-sun "></i> Light mode
                  </div>
                )}
              </button>
            </div>
          </li>
        </ul>
        <ul class="flex flex-col p-4 mt-4 border border-gray-100 rounded-lg bg-green-200 md:flex-row md:space-x-8 md:mt-0 md:text-md md:font-medium md:border-0 md:bg-green-200 dark:bg-gray-800 md:dark:bg-gray-800 dark:border-gray-700">
          <li>
            <a
              class="flex items-center justify-between w-full py-2 pl-3 pr-4 font-semibold text-black rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-green-700 md:p-0 md:w-auto dark:font-semibold dark:text-white dark:hover:text-indigo-400 dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
              href={paths.previousEvents}
            >
              <button>
                <i class="fa-regular fa-calendar-xmark"></i> Previous Events
              </button>
            </a>
          </li>
          <li>
            <a
              class="flex items-center justify-between w-full py-2 pl-3 pr-4 font-semibold text-black rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-green-700 md:p-0 md:w-auto dark:font-semibold dark:text-white dark:hover:text-indigo-400 dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
              href={paths.events}
            >
              <button>
                <i class="fa-solid fa-calendar-days"></i> Active Events
              </button>
            </a>
          </li>
          <li>
            <a
              class="flex items-center justify-between w-full py-2 pl-3 pr-4 font-semibold text-black rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-green-700 md:p-0 md:w-auto dark:font-semibold dark:text-white dark:hover:text-indigo-400 dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
              href={paths.guests}
            >
              <button>
                <i class="fa-solid fa-person"></i> Guests
              </button>
            </a>
          </li>
          <li>
            <a
              class="flex items-center justify-between w-full py-2 pl-3 pr-4 font-semibold text-black rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-green-700 md:p-0 md:w-auto dark:font-semibold dark:text-white dark:hover:text-indigo-400 dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
              href={paths.locations}
            >
              <button>
                <i class="fa-solid fa-location-pin"></i> Locations
              </button>
            </a>
          </li>
          <li>
            <a
              class="flex items-center justify-between w-full py-2 pl-3 pr-4 font-semibold text-black rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-green-700 md:p-0 md:w-auto dark:font-semibold dark:text-white dark:hover:text-indigo-400 dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
              href={paths.contacts}
            >
              <button>
                <i class="fa-solid fa-address-card"></i> Contacts
              </button>
            </a>
          </li>
          <li>
            <a
              class="flex items-center justify-between w-full py-2 pl-3 pr-4 font-semibold text-black rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-green-700 md:p-0 md:w-auto dark:font-semibold dark:text-white dark:hover:text-indigo-400 dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
              href={paths.profile}
            >
              <button>
                <i class="fa-regular fa-user"></i> Profile
              </button>
            </a>
          </li>
          <li>
            <a class="flex items-center justify-between w-full py-2 pl-3 pr-4 font-semibold text-black rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-green-700 md:p-0 md:w-auto dark:font-semibold dark:text-white dark:hover:text-indigo-400 dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent">
              <button
                onClick$={async () => {
                  const logout = await logoutUser();
                  if (logout.result === Status.SUCCESS) {
                    navigate(paths.logout);
                    user.value = "";
                  }
                }}
              >
                <i class="fa-solid fa-right-from-bracket"></i> Logout
              </button>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
});
