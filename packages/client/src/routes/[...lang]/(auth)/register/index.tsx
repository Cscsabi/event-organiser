import { component$, useVisibleTask$, useStore } from "@builder.io/qwik";
import { useNavigate, useLocation } from "@builder.io/qwik-city";
import { getUser, registerUser } from "~/utils/supabase.client";
import type { SignUpWithPasswordCredentials } from "@supabase/supabase-js";
import { paths } from "~/utils/paths";
import { client } from "~/utils/trpc";
import type { CreateUserInput } from "event-organiser-api-server/src/user/user.schema";
import { Status } from "event-organiser-api-server/src/status.enum";
import { capitalize, generateRoutingLink } from "~/utils/common.functions";
import type { RegisterStore } from "~/utils/types";
import { $translate as t, Speak } from "qwik-speak";

export default component$(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const store = useStore<RegisterStore>({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    message: "",
    openToast: false,
    alreadyRegistered: false,
  });

  useVisibleTask$(async () => {
    const result = await getUser();
    if (result.data.user) {
      navigate(generateRoutingLink(location.params.lang, paths.index));
    }
  });

  return (
    <Speak assets={["auth", "common"]}>
      <h1 class="mb-6 text-3xl font-semibold text-black dark:text-white text-center">
        {t("common.register@@Registration Form")}
      </h1>
      <form
        preventdefault:submit
        onSubmit$={async () => {
          store.alreadyRegistered = false;
          const result = await handleRegister(
            store.email,
            store.password,
            store.firstname,
            store.lastname,
            false
          );
          if (result) {
            navigate(generateRoutingLink(location.params.lang, paths.index));
          } else {
            store.alreadyRegistered = true;
          }
        }}
      >
        <div class="mb-6 w-1/2 self-center items-center">
          <div>
            <label
              for="firstname"
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
            >
              {t("common.firstname@@First name:")}
            </label>
            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
              onInput$={(event) =>
                (store.firstname = (event.target as HTMLInputElement).value)
              }
              type="text"
              name="firstname"
              value={store.firstname}
              placeholder={t("common.firstnamePlaceholder@@Sarah")}
              minLength={2}
              required
            ></input>
          </div>
          <div class="input_field">
            <label
              for="lastname"
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
            >
              {t("common.lastname@@Last name:")}
            </label>

            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
              onInput$={(event) =>
                (store.lastname = (event.target as HTMLInputElement).value)
              }
              type="text"
              name="lastname"
              value={store.lastname}
              placeholder={t("common.lastnamePlaceholder@@Smith")}
              minLength={2}
              required
            ></input>
          </div>
          <div class="input_field">
            <label
              for="email"
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
            >
              {t("common.email@@Email:")}
            </label>

            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
              onInput$={(event) =>
                (store.email = (event.target as HTMLInputElement).value)
              }
              type="email"
              name="email"
              minLength={6}
              placeholder={t("common.emailPlaceholder@@sarah.smith@example.com")}
              pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
              value={store.email}
              required
            ></input>
          </div>
          <div class="input_field">
            <label
              for="password"
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
            >
              {t("common.password@@Password:")}
            </label>
            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
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
        <p
          style={store.alreadyRegistered ? "" : "display:none"}
          class="text-red-600"
        >
          {/* You have already registered with this email address! */}
          {t(
            "auth.alreadyRegistered@@You have already registered with this email address!"
          )}
        </p>
        <button
          type="submit"
          class="mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
        >
          {t("common.register@@Sign Up")}
        </button>
      </form>
    </Speak>
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
  if (result.status === Status.SUCCESS) {
    return false;
  }
  const credentials: SignUpWithPasswordCredentials = {
    email: email,
    password: password,
  };

  const customStatus = await registerUser(credentials);
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
