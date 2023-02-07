import { component$, useContext, useStore, useStyles$ } from "@builder.io/qwik";
import {
  loginUserWithPassword,
  loginUserWithProvider,
} from "~/utils/supabase.client";
import type { SignInWithPasswordCredentials } from "@supabase/supabase-js";
import { useNavigate } from "@builder.io/qwik-city";
import { paths } from "~/utils/paths";
import { CTX } from "../../layout";
import styles from "~/routes/index.scss?inline";

export default component$(() => {
  useStyles$(styles);
  const user = useContext(CTX);
  const navigate = useNavigate();

  const store = useStore({
    email: "",
    password: "",
  });

  return (
    <div class="form_wrapper">
      <div class="form_container">
        <div class="title_container">
          <h2>Registration Form</h2>
        </div>
        <div class="row clearfix">
          <div class="">
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
              <div class="input_field">
                {" "}
                <span>
                  <i aria-hidden="true" class="fa fa-envelope"></i>
                </span>
                <input
                  onInput$={(event) =>
                    (store.email = (event.target as HTMLInputElement).value)
                  }
                  type="email"
                  name="email"
                  value={store.email}
                  required
                ></input>
              </div>
              <label for="password">Password:</label>
              <div class="input_field">
                {" "}
                <span>
                  <i aria-hidden="true" class="fa fa-lock"></i>
                </span>
                <input
                  onInput$={(event) =>
                    (store.password = (event.target as HTMLInputElement).value)
                  }
                  type="password"
                  name="password"
                  value={store.password}
                  required
                ></input>{" "}
              </div>
              <input type="submit" value="Login"></input>
              <button
                class="loginBtn loginBtn--google"
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
                Sign in with Google
              </button>
              <button
                class="loginBtn loginBtn--facebook"
                onClick$={() =>
                  loginUserWithProvider({
                    provider: "facebook",
                  }).then((login) => {
                    if (login.result === "success") {
                      navigate.path = paths.index;
                    }
                  })
                }
              >
                Sign in with Facebook
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
});
