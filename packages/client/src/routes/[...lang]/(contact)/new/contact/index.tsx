import { component$, useContext, useStore } from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import { Status } from "event-organiser-api-server/src/status.enum";
import { $translate as t, Speak } from "qwik-speak";
import { CTX } from "~/routes/[...lang]/layout";
import { generateRoutingLink } from "~/utils/common.functions";
import { paths } from "~/utils/paths";
import { client } from "~/utils/trpc";
import type { NewContact } from "~/utils/types";

export default component$(() => {
  const location = useLocation();
  const user = useContext(CTX);
  const store = useStore<NewContact>({
    description: "",
    email: "",
    name: "",
    phone: "",
  });
  const navigate = useNavigate();

  return (
    <Speak assets={["contacts", "common"]}>
      <h1 class="mb-6 text-3xl font-semibold text-white dark:text-white text-center">
        {t("contacts.addContact@@Add Contact")}
      </h1>
      <form
        preventdefault:submit
        onSubmit$={async () => {
          const result = await client.addContact.mutate({
            description: store.description,
            email: store.email,
            name: store.name,
            phone: store.phone,
            userEmail: user.userEmail,
          });

          if (result.status === Status.SUCCESS) {
            navigate(generateRoutingLink(location.params.lang, paths.contacts));
          }
        }}
      >
        <div>
          <label
            class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
            for="contactName"
          >
            {t("contacts.contacts@@Contact Name:")}
          </label>
          <input
            class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-1/2 p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
            onInput$={(event) =>
              (store.name = (event.target as HTMLInputElement).value)
            }
            type="text"
            name="contactName"
            placeholder={t("contacts.contactNamePlaceholder@@Example Ltd.")}
            required
            minLength={3}
          ></input>
        </div>
        <div>
          <label
            class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
            for="phone"
          >
            {t("common.phone@@Phone:")}
          </label>
          <input
            class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-1/2 p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
            onChange$={(event) => {
              store.phone = (event.target as HTMLInputElement).value;
            }}
            type="tel"
            name="phone"
            placeholder={t("common.phonePlaceholder@@123-456-7890")}
          ></input>
        </div>
        <div class="mb-6">
          <label
            class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
            for="email"
          >
            {t("common.email@@Email:")}
          </label>
          <input
            class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-1/2 p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
            onChange$={(event) => {
              store.email = (event.target as HTMLInputElement).value;
            }}
            type="email"
            pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
            minLength={6}
            placeholder={t("common.emailPlaceholder@@sarah.smith@example.com")}
            name="email"
          ></input>
        </div>
        <div class="mb-6">
          <label
            class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
            for="description"
          >
            {t("common.description@@Description:")}
          </label>
          <input
            class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-1/2 p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
            onChange$={(event) => {
              store.description = (event.target as HTMLInputElement).value;
            }}
            type="text"
            name="description"
            placeholder={t(
              "common.descriptionPlaceholder@@Some important information.."
            )}
          ></input>
        </div>
        <button
          class="mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-1/2 sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
          type="submit"
        >
          {t("contacts.addContact@@Add Contact")}
        </button>
      </form>
    </Speak>
  );
});
