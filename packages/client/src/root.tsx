import { component$, useStyles$ } from "@builder.io/qwik";
import {
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
} from "@builder.io/qwik-city";
import { QwikSpeakProvider } from "qwik-speak";
import { RouterHead } from "./components/router-head/router-head";
import globalStyles from "./global.css?inline";
import { config, translationFn } from "./speak-config";

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Dont remove the `<head>` and `<body>` elements.
   */
  useStyles$(globalStyles);
  const darkThemeScript = `if (document.getElementsByTagName("html")[0]) {if (localStorage.getItem("theme") === "dark") {document.getElementsByTagName("html")[0].classList.add("dark")} else if (localStorage.getItem("theme") !== "dark") {document.getElementsByTagName("html")[0].classList.remove("dark")}}`;

  return (
    <QwikSpeakProvider config={config} translationFn={translationFn}>
      <QwikCityProvider>
        <head>
          <script dangerouslySetInnerHTML={darkThemeScript}></script>
          <meta charSet="utf-8" />
          <link rel="manifest" href="/manifest.json" />
          <link
            href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.6.4/flowbite.min.css"
            rel="stylesheet"
          />
          <RouterHead />
        </head>
        <body lang="en" class="px-5 pt-5 pb-10 bg-neutral-50 dark:bg-gray-900">
          <RouterOutlet />
          <ServiceWorkerRegister />
          <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.6.4/flowbite.min.js"></script>
        </body>
      </QwikCityProvider>
    </QwikSpeakProvider>
  );
});
