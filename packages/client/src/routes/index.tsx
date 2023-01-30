import {
  component$,
  useClientEffect$,
  useContext,
  useSignal,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { CTX } from "~/routes/layout";

export default component$(() => {
  const user = useContext(CTX);

  const authTokenValue = useSignal("");
  const authToken: string = import.meta.env.VITE_AUTH_TOKEN;
  useClientEffect$(() => {
    authTokenValue.value = window.location.hash.slice(1);
    console.log(authTokenValue.value);
    if (
      localStorage.getItem(authToken) === null &&
      authTokenValue.value.startsWith("access_token")
    ) {
      console.log("running 2");
      localStorage.setItem(authToken, authTokenValue.value);
      user.value = authTokenValue.value;
    }
  });
  return (
    <div>
      <h1>
        Welcome to Qwik <span class="lightning">⚡️</span>
      </h1>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
