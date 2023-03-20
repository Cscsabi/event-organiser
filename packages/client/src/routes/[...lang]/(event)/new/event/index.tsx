import {
  component$,
  Resource,
  useContext,
  useResource$,
  useStore,
} from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import { EventType } from "@prisma/client";
import { Status } from "event-organiser-api-server/src/status.enum";
import { $translate as t, Speak } from "qwik-speak";
import { CTX } from "~/routes/[...lang]/layout";
import {
  generateRoutingLink,
  getMaxTimeFormat,
  getMinTimeFormat,
  getProperDateFormat,
} from "~/utils/common.functions";
import { paths } from "~/utils/paths";
import { client } from "~/utils/trpc";
import type { GetLocationsReturnType, NewEventStore } from "~/utils/types";

export default component$(() => {
  const user = useContext(CTX);
  const location = useLocation();
  const navigate = useNavigate();
  const store = useStore<NewEventStore>({
    name: "",
    type: EventType.CUSTOM,
    startDate: new Date(),
    endDate: new Date(),
    budget: 0,
    locationId: "",
    headcount: 0,
    decorNeeded: false,
    menuNeeded: false,
    performerNeeded: false,
    chooseHere: t("event.chooseHere@@Choose here"),
    loading: t("common.loading@@Loading..."),
  });

  const resource = useResource$<GetLocationsReturnType>(
    ({ track, cleanup }) => {
      track(() => user.userEmail);

      const controller = new AbortController();
      cleanup(() => controller.abort());
      return client.getLocations.query({ email: user.userEmail });
    }
  );

  return (
    <Speak assets={["event"]}>
      <h1 class="mb-6 text-3xl font-semibold text-black dark:text-white">
        {t("event.createNewEvent@@Create New Event")}
      </h1>
      <div>
        <form
          preventdefault:submit
          onSubmit$={async () => {
            const result = await client.addEvent.mutate({
              budget: store.budget,
              startDate: store.startDate,
              endDate: store.endDate,
              headcount: store.headcount ?? undefined,
              name: store.name,
              type: store.type,
              userEmail: user.userEmail,
              locationId: store.locationId,
              decorNeeded: store.decorNeeded,
              menuNeeded: store.menuNeeded,
              performerNeeded: store.performerNeeded,
            });

            if (result.status === Status.SUCCESS) {
              navigate(
                generateRoutingLink(
                  location.params.lang,
                  paths.event + result.event.id
                )
              );
            }
          }}
        >
          <div>
            <label
              class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
              for="eventName"
            >
              {t("event.eventName@@Event Name:")}
            </label>
            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-1/2 p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
              onInput$={(event) =>
                (store.name = (event.target as HTMLInputElement).value)
              }
              type="text"
              name="eventName"
              required
              placeholder={t("event.eventNamePlaceholder@@Example Event")}
              minLength={3}
            ></input>
          </div>
          <div class="grid gap-6 mb-6 md:grid-cols-4 w-1/2">
            <div>
              <label
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="eventType"
              >
                {t("event.eventType@@Event Type:")}
              </label>
              <select
                class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
                id="eventType"
                name="eventType"
                onClick$={(event) =>
                  (store.type = (event.target as HTMLInputElement)
                    .value as EventType)
                }
              >
                <option value="" selected disabled hidden>
                  {t("event.chooseHere@@Choose here")}
                </option>
                <option value="WEDDING">{t("event.wedding@@Wedding")}</option>
                <option value="GRADUATION">
                  {t("event.graduation@@Graduation")}
                </option>
                <option value="PARTY">{t("event.party@@Party")}</option>
                <option value="CONFERENCE">
                  {t("event.conference@@Conference")}
                </option>
                <option value="EXHIBITION">
                  {t("event.exhibition@@Exhibition")}
                </option>
                <option value="CUSTOM">{t("event.custom@@Custom")}</option>
              </select>
            </div>
            <div>
              <label
                class="pr-4 mb-2 mt-12 text-lg font-medium text-gray-900 dark:text-white"
                for="menu"
              >
                {t("event.menu@@Menu:")}
              </label>
              <input
                class="min-w-4 min-h-4 dark:text-blue-600 bg-gray-300 border-gray-300 rounded dark:focus:ring-blue-500 text-green-800 focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-900 dark:border-gray-600"
                onInput$={(event) =>
                  (store.menuNeeded = (
                    event.target as HTMLInputElement
                  ).checked)
                }
                type="checkbox"
                name="menu"
              ></input>
            </div>
            <div>
              <label
                class="pr-4 mb-2 mt-12 text-lg font-medium text-gray-900 dark:text-white"
                for="decor"
              >
                {t("event.decor@@Decor:")}
              </label>
              <input
                class="min-w-4 min-h-4 dark:text-blue-600 bg-gray-300 border-gray-300 rounded dark:focus:ring-blue-500 text-green-800 focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-900 dark:border-gray-600"
                onInput$={(event) =>
                  (store.decorNeeded = (
                    event.target as HTMLInputElement
                  ).checked)
                }
                type="checkbox"
                name="decor"
              ></input>
            </div>
            <div>
              <label
                class="pr-4 mb-2 mt-12 text-lg font-medium text-gray-900 dark:text-white"
                for="perfomer"
              >
                {t("event.performer@@Performer:")}
              </label>
              <input
                class="min-w-4 min-h-4 dark:text-blue-600 bg-gray-300 border-gray-300 rounded dark:focus:ring-blue-500 text-green-800 focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-900 dark:border-gray-600"
                onInput$={(event) =>
                  (store.performerNeeded = (
                    event.target as HTMLInputElement
                  ).checked)
                }
                type="checkbox"
                name="perfomer"
              ></input>
            </div>
          </div>
          <div class="grid gap-6 mb-6 md:grid-cols-2 w-1/2">
            <div>
              <label
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="startDate"
              >
                {t("common.startDate@@Start Date:")}
              </label>
              <input
                class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
                onChange$={(event) => {
                  const inputs = (event.target as HTMLInputElement).value.split(
                    "-"
                  );
                  store.startDate = new Date(
                    +inputs[0],
                    +inputs[1] - 1, // Starts from zero
                    +inputs[2],
                    store.startDate?.getHours(),
                    store.startDate?.getMinutes()
                  );
                }}
                type="date"
                name="startDate"
                min={getProperDateFormat()}
                // max={getProperDateFormat(store.endDate)}
              ></input>
            </div>
            <div>
              <label
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="startTime"
              >
                {t("common.startTime@@Start Time:")}
              </label>
              <input
                class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
                onChange$={(event) => {
                  const inputs = (event.target as HTMLInputElement).value.split(
                    ":"
                  );
                  store.startDate = new Date(
                    store.startDate?.getFullYear() ?? 0,
                    store.startDate?.getMonth() ?? 0,
                    store.startDate?.getDate(),
                    +inputs[0],
                    +inputs[1] - (store.endDate?.getTimezoneOffset() ?? 0)
                  );
                }}
                type="time"
                name="startTime"
                max={getMaxTimeFormat(store?.startDate, store?.endDate)}
              ></input>
            </div>
            <div>
              <label
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="endDate"
              >
                {t("common.endDate@@End Date:")}
              </label>
              <input
                class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
                onChange$={(event) => {
                  const inputs = (event.target as HTMLInputElement).value.split(
                    "-"
                  );
                  store.endDate = new Date(
                    +inputs[0],
                    +inputs[1] - 1, // Starts from zero
                    +inputs[2],
                    store.endDate?.getHours(),
                    store.endDate?.getMinutes()
                  );
                }}
                type="date"
                name="endDate"
                min={getProperDateFormat(store.startDate)}
              ></input>
            </div>
            <div>
              <label
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="endTime"
              >
                {t("common.endTime@@End Time:")}
              </label>
              <input
                class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
                onChange$={(event) => {
                  const inputs = (event.target as HTMLInputElement).value.split(
                    ":"
                  );
                  store.endDate = new Date(
                    store.endDate?.getFullYear() ?? 0,
                    store.endDate?.getMonth() ?? 0,
                    store.endDate?.getDate(),
                    +inputs[0],
                    +inputs[1] - (store.endDate?.getTimezoneOffset() ?? 0)
                  );
                }}
                type="time"
                name="endTime"
                min={getMinTimeFormat(store?.startDate, store?.endDate)}
              ></input>
            </div>
          </div>
          <div class="grid gap-6 mb-6 md:grid-cols-3 w-1/2 self-center items-center">
            <div>
              <label
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="budget"
              >
                {t("event.eventBudget@@Event Budget:")}
              </label>
              <input
                class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
                onInput$={(event) =>
                  (store.budget = +(event.target as HTMLInputElement).value)
                }
                type="number"
                name="budget"
                placeholder="15000"
                required
              ></input>
            </div>
            <div>
              <label
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="headcount"
              >
                {t("event.headcount@@Headcount:")}
              </label>
              <input
                class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
                onInput$={(event) =>
                  (store.headcount = +(event.target as HTMLInputElement).value)
                }
                type="number"
                placeholder="100"
                name="headcount"
              ></input>
            </div>
            <div>
              <label
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="location"
              >
                {t("event.location@@Location:")}
              </label>
              <Resource
                value={resource}
                onPending={() => <div>{store.loading}</div>}
                onResolved={(result: GetLocationsReturnType) => {
                  return (
                    <div>
                      <select
                        class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
                        name="location"
                        onChange$={(event) => {
                          store.locationId = (
                            event.target as unknown as HTMLInputElement
                          ).value;
                        }}
                      >
                        <option value="" selected disabled hidden>
                          {store.chooseHere}
                        </option>
                        {result.locations.map((location) => {
                          return (
                            <option value={location.id}>{location.name}</option>
                          );
                        })}
                        ;
                      </select>
                    </div>
                  );
                }}
              />
            </div>
          </div>
          <button
            class="mt-6 mr-2 text-white bg-green-700 hover:bg-green-800 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-5 py-2.5 text-centerdark:focus:ring-green-800"
            type="submit"
          >
            {t("event.createEvent@@Create Event")}
          </button>
        </form>
      </div>
    </Speak>
  );
});
