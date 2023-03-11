import {
  component$,
  Resource,
  useBrowserVisibleTask$,
  useResource$,
  useStore,
} from "@builder.io/qwik";
import type { NewEventStore, GetLocationsReturnType } from "~/utils/types";
import { EventType } from "@prisma/client";
import { client } from "~/utils/trpc";
import { getUser } from "~/utils/supabase.client";
import { useNavigate } from "@builder.io/qwik-city";
import { paths } from "~/utils/paths";
import { Status } from "event-organiser-api-server/src/status.enum";
import {
  getMaxTimeFormat,
  getMinTimeFormat,
  getProperDateFormat,
} from "~/utils/common.functions";

export default component$(() => {
  const navigate = useNavigate();
  const store = useStore<NewEventStore>({
    name: "",
    type: EventType.CUSTOM,
    startDate: new Date(),
    endDate: new Date(),
    budget: 0,
    locationId: "",
    userEmail: "",
    headcount: 0,
    decorNeeded: false,
    menuNeeded: false,
    performerNeeded: false,
  });

  const resource = useResource$<GetLocationsReturnType>(
    ({ track, cleanup }) => {
      track(() => store.userEmail);
      const controller = new AbortController();
      cleanup(() => controller.abort());
      return client.getLocations.query({ email: store.userEmail });
    }
  );

  useBrowserVisibleTask$(async () => {
    const userDetails = await getUser();
    if (!userDetails.data.user) {
      navigate(paths.login);
    } else {
      store.userEmail = userDetails.data.user.email ?? "";
    }
  });

  return (
    <div>
      <h1 class="mb-6 text-3xl font-semibold text-black dark:text-white">
        Create New Event
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
              userEmail: store.userEmail,
              locationId: store.locationId,
              decorNeeded: store.decorNeeded,
              menuNeeded: store.menuNeeded,
              performerNeeded: store.performerNeeded,
            });

            if (result.status === Status.SUCCESS) {
              navigate(paths.event + result.event.id);
            }
          }}
        >
          <div>
            <label
              class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
              for="eventName"
            >
              Event name:
            </label>
            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-1/2 p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
              onInput$={(event) =>
                (store.name = (event.target as HTMLInputElement).value)
              }
              type="text"
              name="eventName"
              required
              placeholder="Example Event"
              minLength={3}
            ></input>
          </div>
          <div class="grid gap-6 mb-6 md:grid-cols-4 w-1/2">
            <div>
              <label
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="eventType"
              >
                Event type:
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
                  Choose here
                </option>
                <option value="WEDDING">WEDDING</option>
                <option value="GRADUATION">GRADUATION</option>
                <option value="PARTY">PARTY</option>
                <option value="CONFERENCE">CONFERENCE</option>
                <option value="EXHIBITION">EXHIBITION</option>
                <option value="CUSTOM">CUSTOM</option>
              </select>
            </div>
            <div>
              <label
                class="pr-4 mb-2 mt-12 text-lg font-medium text-gray-900 dark:text-white"
                for="menu"
              >
                Menu:
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
                Decor:
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
                Performer:
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
                Start Date:
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
                Start Time:
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
                End Date:
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
                End Time:
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
                Event budget:
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
                Headcount:
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
                Location:
              </label>
              <Resource
                value={resource}
                onPending={() => <div>Loading...</div>}
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
                          Choose here
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
            Create Event
          </button>
        </form>
      </div>
    </div>
  );
});
