import { component$, useBrowserVisibleTask$, useContext, useStore } from "@builder.io/qwik";
import {
  getUser,
  loginUserWithPassword,
  loginUserWithProvider,
} from "~/utils/supabase.client";
import type { SignInWithPasswordCredentials } from "@supabase/supabase-js";
import { useNavigate } from "@builder.io/qwik-city";
import { paths } from "~/utils/paths";
import { CTX } from "../../layout";
import { Status } from "event-organiser-api-server/src/status.enum";
import type { LoginStore } from "~/utils/types";

export default component$(() => {
  const user = useContext(CTX);
  const navigate = useNavigate();

  const store = useStore<LoginStore>({
    email: "",
    password: "",
    invalidCredentials: false,
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
        Login Form
      </h1>
      <form
        preventdefault:submit
        onSubmit$={async () => {
          store.invalidCredentials = false;
          // TODO: Check the values, send feedback according to the input
          const credentials: SignInWithPasswordCredentials = {
            email: store.email,
            password: store.password,
          };
          const login = await loginUserWithPassword(credentials);
          if (login?.result === Status.SUCCESS) {
            navigate(paths.index);
            user.value = login.data?.session?.access_token ?? "";
          } else {
            store.invalidCredentials = true;
          }
        }}
      >
        <div class="mb-6 w-1/2 self-center items-center">
          <div>
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
              placeholder="sarah.smith@example.com"
              pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
              value={store.email}
              required
            ></input>
          </div>
          <div>
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
          The email or password you entered is incorrect!
        </p>
        <button
          type="submit"
          class="mt-6 mr-2 text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
        >
          Sign in
        </button>
        <button
          type="button"
          class="text-white mr-2 bg-amber-700	 hover:bg-amber-800 focus:ring-4 focus:outline-none focus:ring-amber-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-amber-600 dark:hover:bg-amber-700 dark:focus:ring-amber-800"
          onClick$={async () => {
            const login = await loginUserWithProvider({
              provider: "google",
            });
            if (login.result === Status.SUCCESS) {
              navigate(paths.index);
            }
          }}
        >
          Sign in with Google
        </button>
        <button
          type="button"
          class="text-white mr-2 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          onClick$={async () => {
            const login = await loginUserWithProvider({
              provider: "facebook",
            });
            if (login.result === Status.SUCCESS) {
              navigate(paths.index);
            }
          }}
        >
          Sign in with Facebook
        </button>
      </form>
    </div>
  );
});
