import { component$, useContext, useStore } from "@builder.io/qwik";
import { useLocation, useNavigate, type DocumentHead } from "@builder.io/qwik-city";
import { Status } from "event-organiser-api-server/src/status.enum";
import { $translate as t, Speak } from "qwik-speak";
import HintCard from "~/components/hint-card/hint.card";
import { CTX } from "~/routes/[...lang]/layout";
import { generateRoutingLink } from "~/utils/common.functions";
import { paths } from "~/utils/paths";
import { client } from "~/utils/trpc";
import type { NewGuest } from "~/utils/types";

export default component$(() => {
  const location = useLocation();
  const user = useContext(CTX);
  const store = useStore<NewGuest>({
    description: "",
    email: "",
    firstname: "",
    lastname: "",
  });
  const navigate = useNavigate();

  return (
    <Speak assets={["guestlist", "common", "hint"]}>
      <h1 class="mb-6 text-center text-3xl font-semibold text-black dark:text-white">
        {t("guestlist.addGuest@@Add Guest")}
      </h1>
      <div class="grid gap-4 mb-6 md:grid-cols-2 w-full place-content-between">
        <form
          preventdefault:submit
          onSubmit$={async () => {
            const result = await client.createGuest.mutate({
              description: store.description,
              email: store.email,
              firstname: store.firstname,
              lastname: store.lastname,
              userEmail: user.userEmail ?? "",
            });

            if (result.status === Status.SUCCESS) {
              navigate(
                generateRoutingLink(location.params.lang, paths.guests),
                true
              );
            }
          }}
        >
          <div>
            <label
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
              for="firstname"
            >
              {t("common.firstname@@First name:")}
            </label>
            <input
              class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              onInput$={(event) =>
                (store.firstname = (event.target as HTMLInputElement).value)
              }
              type="text"
              name="firstname"
              placeholder={t("guestlist.guestFirstnamePlaceholder@@Sarah")}
              required
              minLength={3}
            ></input>
          </div>
          <div>
            <label
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
              for="lastname"
            >
              {t("common.lastname@@Last name:")}
            </label>
            <input
              class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              onChange$={(event) => {
                store.lastname = (event.target as HTMLInputElement).value;
              }}
              type="tel"
              name="phone"
              placeholder={t("guestlist.guestLastnamePlaceholder@@Smith")}
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
              class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
              for="description"
            >
              {t("common.description@@Description:")}
            </label>
            <input
              class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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
            class="mt-6 mr-2 text-white bg-sky-600 hover:bg-sky-700 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-700 dark:hover:bg-blue-600"
            type="submit"
          >
            {t("guestlist.addGuest@@Add Guest")}
          </button>
        </form>
        <HintCard
          hint1={t(
            "hint.newGuestHint1@@After adding guests you can assign them directly to your events"
          )}
          hint2={t(
            "hint.newGuestHint2@@When your guestlist is complete, you can send them an invitation, by pressing the Send event to Guests via email button on the event's page"
          )}
        />
      </div>
    </Speak>
  );
});

export const head: DocumentHead = {
  title: 'Add Guest',
};