import { component$, useStore } from "@builder.io/qwik";
import { type DocumentHead, useLocation, useNavigate } from "@builder.io/qwik-city";
import type { SignInWithPasswordCredentials } from "@supabase/supabase-js";
import { Status } from "event-organiser-api-server/src/status.enum";
import { $translate as t, Speak } from "qwik-speak";
import { generateRoutingLink } from "~/utils/common.functions";
import { paths } from "~/utils/paths";
import {
  loginUserWithPassword,
  loginUserWithProvider,
} from "~/utils/supabase.client";
import type { LoginStore } from "~/utils/types";

export default component$(() => {
  const navigate = useNavigate();
  const location = useLocation();

  const store = useStore<LoginStore>({
    email: "",
    password: "",
    invalidCredentials: false,
  });

  return (
    <Speak assets={["auth", "common"]}>
      <h1 class="mb-6 text-3xl font-semibold text-black dark:text-white text-center">
        {t("common.login@@Login Form")}
      </h1>
      <form
        preventdefault:submit
        onSubmit$={async () => {
          store.invalidCredentials = false;
          const credentials: SignInWithPasswordCredentials = {
            email: store.email,
            password: store.password,
          };
          const login = await loginUserWithPassword(credentials);
          if (login?.result === Status.SUCCESS) {
            navigate(
              generateRoutingLink(location.params.lang, paths.index),
              true
            );
          } else {
            store.invalidCredentials = true;
          }
        }}
      >
        <div class="mb-6 w-1/2 self-center items-center">
          <div>
            <label
              for="email"
              class="block mb-2 mt-6 text-2xl font-medium text-gray-900 dark:text-white"
            >
              {t("common.email@@Email:")}
            </label>
            <input
              class="bg-gray-300 border border-slate-400 text-gray-900 text-xl rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              onInput$={(event) =>
                (store.email = (event.target as HTMLInputElement).value)
              }
              type="email"
              name="email"
              placeholder={t(
                "common.emailPlaceholder@@sarah.smith@example.com"
              )}
              pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
              value={store.email}
              required
            ></input>
          </div>
          <div>
            <label
              for="password"
              class="block mb-2 mt-6 text-2xl font-medium text-gray-900 dark:text-white"
            >
              {t("common.password@@Password:")}
            </label>
            <input
              class="bg-gray-300 border border-slate-400 text-gray-900 text-xl rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              onInput$={(event) =>
                (store.password = (event.target as HTMLInputElement).value)
              }
              type="password"
              name="password"
              value={store.password}
              placeholder="••••••••"
              required
            ></input>
          </div>
        </div>
        <p
          style={store.invalidCredentials ? "" : "display:none"}
          class="text-red-600"
        >
          {t(
            "auth.invalidCredentials@@The email or password you entered is incorrect!"
          )}
        </p>
        <button
          type="submit"
          class="mt-6 mr-2 text-white bg-sky-600 hover:bg-sky-700 font-medium rounded-lg text-xl w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          {t("common.login@@Sign In")}
        </button>
        <button
          type="button"
          class="text-white mr-2 bg-orange-700 hover:bg-orange-500 font-medium rounded-lg text-xl w-full sm:w-auto px-5 py-2.5 text-center dark:bg-orange-700 dark:hover:bg-orange-500"
          onClick$={async () => {
            const login = await loginUserWithProvider({
              provider: "google",
            });
            if (login.result === Status.SUCCESS) {
              navigate(
                generateRoutingLink(location.params.lang, paths.index),
                true
              );
            }
          }}
        >
          {t("auth.signinGoogle@@Sign in with Google")}
        </button>
        <button
          type="button"
          class="text-white mr-2 bg-blue-700 hover:bg-indigo-400 font-medium rounded-lg text-xl w-full sm:w-auto px-5 py-2.5 text-center"
          onClick$={async () => {
            const login = await loginUserWithProvider({
              provider: "facebook",
            });
            if (login.result === Status.SUCCESS) {
              navigate(
                generateRoutingLink(location.params.lang, paths.index),
                true
              );
            }
          }}
        >
          {t("auth.signinFacebook@@Sign in with Facebook")}
        </button>
      </form>
    </Speak>
  );
});

export const head: DocumentHead = {
  title: 'Login',
};