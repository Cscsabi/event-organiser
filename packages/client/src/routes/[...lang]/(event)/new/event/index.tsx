import {
  component$,
  Resource,
  useContext,
  useResource$,
  useStore,
} from "@builder.io/qwik";
import {
  useLocation,
  useNavigate,
  type DocumentHead,
} from "@builder.io/qwik-city";
import { EventType } from "@prisma/client";
import { Status } from "event-organiser-api-server/src/status.enum";
import { $translate as t, Speak } from "qwik-speak";
import HintCard from "~/components/hint-card/hint.card";
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
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const user = useContext(CTX);
  const location = useLocation();
  const navigate = useNavigate();
  const store = useStore<NewEventStore>({
    name: "",
    type: EventType.CUSTOM,
    startDate: tomorrow,
    endDate: tomorrow,
    budget: 0,
    locationId: "",
    headcount: 0,
    chooseHere: "",
    loading: "",
    rejected: "",
  });

  store.chooseHere = t("event.chooseHere@@Choose here");
  store.loading = t("common.loading@@Loading...");
  store.rejected = t("common.rejected@@Failed to load data");

  const resource = useResource$<GetLocationsReturnType>(
    ({ track, cleanup }) => {
      track(() => user.userEmail);
      const controller = new AbortController();
      cleanup(() => controller.abort());
      return client.getLocations.query({ email: user.userEmail ?? "" });
    }
  );

  return (
    <Speak assets={["event"]}>
      <h1 class="mb-6 text-3xl text-center font-semibold text-black dark:text-white">
        {t("event.createNewEvent@@Create New Event")}
      </h1>
      <div class="grid gap-4 mb-6 md:grid-cols-2 w-full place-content-between">
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
              userEmail: user.userEmail ?? "",
              locationId: store.locationId,
            });

            if (result.status === Status.SUCCESS) {
              navigate(
                generateRoutingLink(
                  location.params.lang,
                  paths.event + result.event.id
                ),
                true
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
              class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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
          <div class="grid gap-6 mb-6 md:grid-cols-2 w-full">
            <div>
              <label
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="eventType"
              >
                {t("event.eventType@@Event Type:")}
              </label>
              <select
                class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-slate-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
                id="eventType"
                name="eventType"
                onClick$={(event) =>
                  (store.type = (event.target as HTMLInputElement)
                    .value as EventType)
                }
              >
                <option value="" selected disabled hidden>
                  {store.chooseHere}
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
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="location"
              >
                {t("event.location@@Location:")}
              </label>
              <Resource
                value={resource}
                onPending={() => <div>{store.loading}</div>}
                onRejected={() => <div>{store.rejected}</div>} //TODO
                onResolved={(result: GetLocationsReturnType) => {
                  return (
                    <div>
                      <select
                        class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-slate-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
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
          <div class="grid gap-6 mb-6 md:grid-cols-2 w-full">
            <div>
              <label
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="startDate"
              >
                {t("common.startDate@@Start Date:")}
              </label>
              <input
                class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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
                class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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
                class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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
                class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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
          <div class="grid gap-6 mb-6 md:grid-cols-2 w-full self-center items-center">
            <div>
              <label
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="budget"
              >
                {t("event.eventBudget@@Event Budget:")}
              </label>
              <input
                class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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
                class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                onInput$={(event) =>
                  (store.headcount = +(event.target as HTMLInputElement).value)
                }
                type="number"
                placeholder="100"
                name="headcount"
              ></input>
            </div>
          </div>
          <button
            class="mt-6 mr-2 text-white bg-sky-600 hover:bg-sky-700 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-700 dark:hover:bg-blue-600"
            type="submit"
          >
            {t("event.createEvent@@Create Event")}
          </button>
        </form>
        <HintCard
          hint1={t(
            "hint.newEventHint1@@Having at least one location added is the prerequisite of creating an event"
          )}
          hint2={t(
            "hint.newEventHint2@@To be able to plan your budget first you need to add contacts"
          )}
        />
      </div>
    </Speak>
  );
});

export const head: DocumentHead = {
  title: "Create Event",
};
