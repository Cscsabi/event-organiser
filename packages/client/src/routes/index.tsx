import {
  component$,
  useClientEffect$,
  useContext,
  useSignal,
} from "@builder.io/qwik";
import { CTX } from "~/routes/layout";
import { getUser } from "~/utils/supabase.client";

export default component$(() => {
  const userEmail = useContext(CTX);

  const authTokenValue = useSignal("");
  const authToken: string = import.meta.env.VITE_AUTH_TOKEN;
  useClientEffect$(async () => {
    authTokenValue.value = window.location.hash.slice(1);
    if (
      localStorage.getItem(authToken) === null &&
      authTokenValue.value.startsWith("access_token")
    ) {
      localStorage.setItem(authToken, authTokenValue.value);
      const userDetails = await getUser();
      userEmail.value = userDetails.data.user?.email ?? "";
    }
  });

  return (
    <div>
      <h1>
        Welcome to Event Organiser! <i class="fa-solid fa-calendar-days"></i>
      </h1>
    </div>
  );
});
