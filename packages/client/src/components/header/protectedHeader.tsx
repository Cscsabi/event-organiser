import { component$, useBrowserVisibleTask$, useContext, useSignal } from "@builder.io/qwik";
import { useNavigate, Link } from "@builder.io/qwik-city";
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
    <header class="overflow-hidden dark:bg-slate-700 bg-violet-400 pl-8 pr-8 pb-6 pt-4">
      <Link
        class="float-left hover:text-violet-700 pt-3.5 pr-4 dark:hover:text-blue-500 font-bold dark:font-bold dark:text-white"
        href={paths.index}
      >
        <i class="fa-solid fa-calendar-days"></i> Home
      </Link>
      <button
        class="float-left"
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
          <div class="cursor-pointer hover:text-violet-700 pt-3.5 pr-4  dark:hover:text-blue-500 font-bold dark:font-bold dark:text-white">
            <i class="fa-regular fa-moon "></i> Dark mode
          </div>
        ) : (
          <div class="cursor-pointer hover:text-violet-700 pt-3.5 pr-4  dark:hover:text-blue-500 font-bold dark:font-bold dark:text-white">
            <i class="fa-regular fa-sun "></i> Light mode
          </div>
        )}
      </button>
      <Link class="float-right cursor-pointer hover:text-violet-700 pt-3.5 pr-4  dark:hover:text-blue-500 font-bold dark:font-bold dark:text-white">
        <button
          onClick$={async () => {
            console.log("Clicked!");
            const logout = await logoutUser();
            if (logout.result === Status.SUCCESS) {
              navigate(paths.logout);
              user.value = "";
            }
          }}
        >
          <i class="fa-solid fa-right-from-bracket"></i> Logout
        </button>
      </Link>

      <Link
        class="float-right hover:text-violet-700 pt-3.5 pr-4  dark:hover:text-blue-500 font-bold dark:font-bold dark:text-white"
        href={paths.profile}
      >
        <i class="fa-regular fa-user"></i> Profile
      </Link>
      <Link
        class="float-right hover:text-violet-700 pt-3.5 pr-4  dark:hover:text-blue-500 font-bold dark:font-bold dark:text-white"
        href={paths.contacts}
      >
        <i class="fa-solid fa-address-card"></i> Contacts
      </Link>
      <Link
        class="float-right hover:text-violet-700 pt-3.5 pr-4  dark:hover:text-blue-500 font-bold dark:font-bold dark:text-white"
        href={paths.locations}
      >
        <i class="fa-solid fa-location-pin"></i> Locations
      </Link>
      <Link
        class="float-right hover:text-violet-700 pt-3.5 pr-4  dark:hover:text-blue-500 font-bold dark:font-bold dark:text-white"
        href={paths.guests}
      >
        <i class="fa-solid fa-person"></i> Guests
      </Link>
      <Link
        class="float-right hover:text-violet-700 pt-3.5 pr-4  dark:hover:text-blue-500 font-bold dark:font-bold dark:text-white"
        href={paths.events}
      >
        <i class="fa-solid fa-calendar-days"></i> Active Events
      </Link>
      <Link
        class="float-right text-center hover:text-violet-700 pt-3.5 pr-4  dark:hover:text-blue-500 font-bold dark:font-bold dark:text-white"
        href={paths.previousEvents}
      >
        <i class="fa-regular fa-calendar-xmark"></i> Previous Events
      </Link>
    </header>
  );
});
