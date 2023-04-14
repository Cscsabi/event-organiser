import { component$, useContext, useStore } from "@builder.io/qwik";
import { useLocation, useNavigate, type DocumentHead } from "@builder.io/qwik-city";
import { Status } from "event-organiser-api-server/src/status.enum";
import { $translate as t, Speak } from "qwik-speak";
import HintCard from "~/components/hint-card/hint.card";
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
    link: "",
  });
  const navigate = useNavigate();

  return (
    <Speak assets={["contact", "common", "hint"]}>
      <h1 class="mb-6 text-center text-3xl font-semibold text-black dark:text-white">
        {t("contact.addContact@@Add Contact")}
      </h1>
      <div class="grid gap-4 mb-6 md:grid-cols-2 w-full place-content-between">
        <form
          preventdefault:submit
          onSubmit$={async () => {
            const result = await client.addContact.mutate({
              description: store.description,
              email: store.email,
              name: store.name,
              phone: store.phone,
              link: store.link,
              userEmail: user.userEmail ?? "",
            });

            if (result.status === Status.SUCCESS) {
              navigate(
                generateRoutingLink(location.params.lang, paths.contacts),
                true
              );
            }
          }}
        >
          <div>
            <label
              class="block mb-2 mt-6 text-2xl font-medium text-gray-900 dark:text-white"
              for="contactName"
            >
              {t("contact.contact@@Contact Name:")}
            </label>
            <input
              class="bg-gray-300 border border-slate-400 text-gray-900 text-xl rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              onInput$={(event) =>
                (store.name = (event.target as HTMLInputElement).value)
              }
              type="text"
              name="contactName"
              placeholder={t("contact.contactNamePlaceholder@@Example Ltd.")}
              required
              minLength={3}
            ></input>
          </div>
          <div>
            <label
              class="block mb-2 mt-6 text-2xl font-medium text-gray-900 dark:text-white"
              for="phone"
            >
              {t("common.phone@@Phone:")}
            </label>
            <input
              class="bg-gray-300 border border-slate-400 text-gray-900 text-xl rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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
              class="block mb-2 mt-6 text-2xl font-medium text-gray-900 dark:text-white"
              for="email"
            >
              {t("common.email@@Email:")}
            </label>
            <input
              class="bg-gray-300 border border-slate-400 text-gray-900 text-xl rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              onChange$={(event) => {
                store.email = (event.target as HTMLInputElement).value;
              }}
              type="email"
              pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
              minLength={6}
              placeholder={t(
                "common.emailPlaceholder@@sarah.smith@example.com"
              )}
              name="email"
            ></input>
          </div>
          <div class="mb-6">
            <label
              class="block mb-2 mt-6 text-2xl font-medium text-gray-900 dark:text-white"
              for="description"
            >
              {t("common.description@@Description:")}
            </label>
            <input
              class="bg-gray-300 border border-slate-400 text-gray-900 text-xl rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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
          <div>
            <label
              class="block mb-2 mt-6 text-2xl font-medium text-gray-900 dark:text-white"
              for="link"
            >
              {t("common.link@@Link:")}
            </label>
            <input
              class="bg-gray-300 border border-slate-400 text-gray-900 text-xl rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              onInput$={(event) =>
                (store.link = (event.target as HTMLInputElement).value)
              }
              type="url"
              name="link"
              placeholder={t("contact.contactLinkPlaceholder@@Website url")}
              minLength={3}
            ></input>
          </div>
          <button
            class="mt-6 mr-2 text-white bg-sky-600 hover:bg-sky-700 font-medium rounded-lg text-xl w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-700 dark:hover:bg-blue-600"
            type="submit"
          >
            {t("contact.addContact@@Add Contact")}
          </button>
        </form>
        <HintCard
          hint1={t(
            "hint.newContactHint1@@After adding contacts you can use them when you are planning your budget"
          )}
          hint2={t(
            "hint.newContactHint2@@You can simply select the contacts that you added earlier on the event's budget planning section"
          )}
        />
      </div>
    </Speak>
  );
});

export const head: DocumentHead = {
  title: 'Add Contact',
};