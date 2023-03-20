import { component$, useVisibleTask$ } from "@builder.io/qwik";
import { $translate as t, Speak } from "qwik-speak";

export default component$(() => {
  
  useVisibleTask$(async () => {
    const authToken: string = import.meta.env.VITE_AUTH_TOKEN;
    let authTokenValue = "";

    authTokenValue = window.location.hash.slice(1);
    if (
      localStorage.getItem(authToken) === null &&
      authTokenValue.startsWith("access_token")
    ) {
      localStorage.setItem(authToken, authTokenValue);
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
