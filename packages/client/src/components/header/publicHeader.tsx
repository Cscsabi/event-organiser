import {
  component$,
  useBrowserVisibleTask$,
  useSignal,
} from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { paths } from "~/utils/paths";

export const PublicHeader = component$(() => {
  const darkMode = useSignal<boolean>();

  useBrowserVisibleTask$(({ track }) => {
    track(() => darkMode.value);
    const rootTag = document.getElementsByTagName("html")[0];
    if (darkMode.value === undefined) {
      darkMode.value = rootTag.classList.contains("dark");
    }
    
    if (darkMode.value && !rootTag.classList.contains("dark")) {
      rootTag.classList.add("dark");
    } else if (!darkMode.value && rootTag.classList.contains("dark")) {
      rootTag.classList.remove("dark");
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
      <Link
        class="float-right cursor-pointer hover:text-violet-700 pt-3.5 pr-4  dark:hover:text-blue-500 font-bold dark:font-bold dark:text-white"
        href={paths.login}
      >
        <i class="fa-solid fa-right-to-bracket"></i> Login
      </Link>
      <Link
        class="float-right cursor-pointer hover:text-violet-700 pt-3.5 pr-4  dark:hover:text-blue-500 font-bold dark:font-bold dark:text-white"
        href={paths.register}
      >
        <i class="fa-solid fa-user-plus"></i> Register
      </Link>
    </header>
  );
});
