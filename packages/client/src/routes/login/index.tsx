import { component$, useContext, useStore } from "@builder.io/qwik";
import {
  loginUserWithPassword,
  loginUserWithProvider,
} from "~/utils/supabase.client";
import type { SignInWithPasswordCredentials } from "@supabase/supabase-js";
import { useNavigate } from "@builder.io/qwik-city";
import { paths } from "~/utils/paths";
import { CTX } from "../layout";

export default component$(() => {
  const user = useContext(CTX);
  const navigate = useNavigate();

  const store = useStore({
    email: "",
    password: "",
  });

  return (
    <>
      <form
        preventdefault:submit
        onSubmit$={() => {
          // TODO: Check the values, send feedback according to the input
          const credentials: SignInWithPasswordCredentials = {
            email: store.email,
            password: store.password,
          };
          loginUserWithPassword(credentials).then((login) => {
            if (login?.result === "success") {
              navigate.path = paths.index;
              user.value = login.data?.session?.access_token || "";
            }
          });
        }}
      >
        <label for="email">Email:</label>
        <input
          onInput$={(event) =>
            (store.email = (event.target as HTMLInputElement).value)
          }
          type="text"
          name="email"
          value={store.email}
        ></input>
        <label for="password">Password:</label>
        <input
          onInput$={(event) =>
            (store.password = (event.target as HTMLInputElement).value)
          }
          type="password"
          name="password"
          value={store.password}
        ></input>
        <button type="submit">
          <i class="fa-solid fa-right-to-bracket"></i> Sign in
        </button>
        <button
          onClick$={() =>
            loginUserWithProvider({
              provider: "google",
            }).then((login) => {
              if (login.result === "success") {
                navigate.path = paths.index;
              }
            })
          }
        >
          <i class="fa-solid fa-right-to-bracket"></i> Sign in with Google
        </button>
      </form>
    </>
  );
});
