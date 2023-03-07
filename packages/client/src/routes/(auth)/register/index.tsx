import { component$, useBrowserVisibleTask$, useStore } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { getUser, registerUser } from "~/utils/supabase.client";
import type { SignUpWithPasswordCredentials } from "@supabase/supabase-js";
import { paths } from "~/utils/paths";
import { client } from "~/utils/trpc";
import type { CreateUserInput } from "event-organiser-api-server/src/user/user.schema";
import { Status } from "event-organiser-api-server/src/status.enum";
import { capitalize } from "~/utils/common.functions";
import type { RegisterStore } from "~/utils/types";

export default component$(() => {
  const navigate = useNavigate();
  const store = useStore<RegisterStore>({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    message: "",
    openToast: false,
  });

  useBrowserVisibleTask$(async () => {
    const result = await getUser();
    if (result.data.user) {
      navigate(paths.index);
    }
  });

  return (
    <div>
      <h1 class="mb-6 text-3xl font-semibold text-black dark:text-white">
        Registration Form
      </h1>
      <form
        preventdefault:submit
        onSubmit$={async () => {
          const result = await handleRegister(
            store.email,
            store.password,
            store.firstname,
            store.lastname,
            false
          );
          if (result) {
            navigate(paths.index);
          }
        }}
      >
        <div class="mb-6 w-1/2 self-center items-center">
          <div>
            <label
              for="firstname"
              class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
            >
              First name:
            </label>
            <input
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onInput$={(event) =>
                (store.firstname = (event.target as HTMLInputElement).value)
              }
              type="text"
              name="firstname"
              value={store.firstname}
              placeholder="Sarah"
              minLength={2}
              required
            ></input>
          </div>
          <div class="input_field">
            <label
              for="lastname"
              class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
            >
              Last name:
            </label>

            <input
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onInput$={(event) =>
                (store.lastname = (event.target as HTMLInputElement).value)
              }
              type="text"
              name="lastname"
              value={store.lastname}
              placeholder="Smith"
              minLength={2}
              required
            ></input>
          </div>
          <div class="input_field">
            <label
              for="email"
              class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
            >
              Email:
            </label>

            <input
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onInput$={(event) =>
                (store.email = (event.target as HTMLInputElement).value)
              }
              type="email"
              name="email"
              minLength={6}
              placeholder="sarah.smith@example.com"
              pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
              value={store.email}
              required
            ></input>
          </div>
          <div class="input_field">
            <label
              for="password"
              class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
            >
              Password:
            </label>
            <input
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onInput$={(event) =>
                (store.password = (event.target as HTMLInputElement).value)
              }
              minLength={8}
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
              title="Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters"
              type="password"
              name="password"
              value={store.password}
              placeholder="••••••••"
              required
            ></input>
          </div>
        </div>
        <button
          type="submit"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
});

export async function handleRegister(
  email: string,
  password: string,
  firstname: string,
  lastname: string,
  darkModeEnabled: boolean
) {
  const result = await client.getUser.query({ email: email });
  console.log(result.status);
  if (result.status === Status.SUCCESS) {
    return false;
  }
  const credentials: SignUpWithPasswordCredentials = {
    email: email,
    password: password,
  };

  const customStatus = await registerUser(credentials);
  console.log(customStatus);
  if (customStatus.result === Status.SUCCESS) {
    const detailedCredentials: CreateUserInput = {
      email: email.toLowerCase(),
      firstname: capitalize(firstname),
      lastname: capitalize(lastname),
      darkModeEnabled: darkModeEnabled,
    };

    const finalResult = await client.createUser.mutate(detailedCredentials);
    if (finalResult.status) {
      return true;
    }
  }
  return false;
}
