import {
  component$,
  useVisibleTask$,
  useContext,
  useSignal,
} from "@builder.io/qwik";
import { CTX } from "~/routes/layout";
import { getUser } from "~/utils/supabase.client";
import { $translate as t, Speak } from "qwik-speak";

export default component$(() => {
  const userEmail = useContext(CTX);

  const authTokenValue = useSignal("");
  const authToken: string = import.meta.env.VITE_AUTH_TOKEN;

  useVisibleTask$(async () => {
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
    <Speak assets={["home"]}>
      <div>
        <h1 class="mt-16 mb-6 text-3xl font-bold dark:text-white">
          {t("home.welcome@@Welcome to Event Organiser!")}{" "}
          <i class="fa-solid fa-house-user"></i>
        </h1>
      </div>{" "}
    </Speak>
  );
});
