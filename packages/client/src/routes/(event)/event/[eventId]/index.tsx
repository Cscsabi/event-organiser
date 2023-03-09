import {
  component$,
  useStore,
  useBrowserVisibleTask$,
  useResource$,
  Resource,
} from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import type { StaticGenerateHandler } from "@builder.io/qwik-city";
import { client } from "~/utils/trpc";
import type {
  EventStore,
  GetFeedbackReturnType,
  LocationStore,
  NewEventStore,
} from "~/utils/types";
import { getUser } from "~/utils/supabase.client";
import { paths } from "~/utils/paths";
import { EventType } from "@prisma/client";
import { GuestList } from "~/components/guestlist/guestlist";
import * as ics from "ics";
import {
  getDateOrUndefined,
  getProperDateFormat,
  getProperTimeFormat,
} from "~/utils/common.functions";
import { BudgetPlanning } from "~/components/budget-planning/budget.planning";
import Modal from "~/components/modal/modal";
import Toast from "~/components/toast/toast";
import { Status } from "event-organiser-api-server/src/status.enum";

export default component$(() => {
  const location = useLocation();
  const navigate = useNavigate();

  const store = useStore<EventStore>({
    event: {
      budget: 0,
      decorNeeded: false,
      userEmail: "",
      endDate: new Date(),
      headcount: 0,
      locationId: location.params.eventId,
      menuNeeded: false,
      name: "",
      performerNeeded: false,
      startDate: new Date(),
      type: EventType.CUSTOM,
    },
    location: {
      addressId: "",
      city: "",
      countryId: 0,
      description: "",
      userEmail: "",
      link: "",
      name: "",
      phone: "",
      price: 0,
      state: "",
      street: "",
      type: "",
      zipCode: 0,
    },
    modalOpen: false,
    userEmail: "",
  });

  useBrowserVisibleTask$(async ({ track }) => {
    track(() => store.userEmail);
    const userDetails = await getUser();
    if (!userDetails.data.user) {
      navigate(paths.login);
    }

    store.userEmail = userDetails.data.user?.email ?? "";
    console.log(store.userEmail);

    const event = await getCurrentEvent(location.params.eventId);
    if (event) {
      if (event.endDate && event.endDate < new Date()) {
        navigate(paths.previousEvent + location.params.eventId);
      }

      const currentEvent: NewEventStore = {
        budget: +event.budget,
        startDate: event.startDate ?? undefined,
        endDate: event.endDate ?? undefined,
        userEmail: event.userEmail,
        headcount: event.headcount ?? undefined,
        locationId: event.locationId,
        name: event.name,
        type: event.type ?? undefined,
        decorNeeded: event.decorNeeded,
        menuNeeded: event.menuNeeded,
        performerNeeded: event.performerNeeded,
      };

      const currentLocation: LocationStore = {
        addressId: event.location.addressId,
        city: event.location.address.city,
        countryId: event.location.address.countryId,
        description: event.location.description ?? undefined,
        userEmail: event.location.userEmail,
        link: event.location.link ?? undefined,
        name: event.location.name,
        phone: event.location.phone ?? undefined,
        price: event.location.price as unknown as number,
        state: event.location.address.state ?? undefined,
        street: event.location.address.street,
        type: event.location.type ?? undefined,
        zipCode: event.location.address.zip_code as unknown as number,
      };

      store.event = currentEvent;
      store.location = currentLocation;
    }
  });

  const resource = useResource$<GetFeedbackReturnType>(({ track, cleanup }) => {
    track(() => store.userEmail);
    const controller = new AbortController();
    cleanup(() => controller.abort());
    return client.getFeedbacks.query({ id: location.params.eventId });
  });

  return (
    <div>
      <div class="grid gap-4 mb-6 md:grid-cols-2 w-full place-content-between">
        <div>
          <div>
            <label
              class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
              for="name"
            >
              Name:
            </label>
            <input
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              type="text"
              onChange$={(event) =>
                (store.event.name = (event.target as HTMLInputElement).value)
              }
              value={store.event?.name}
            ></input>
          </div>
          <div class="grid gap-6 mb-6 md:grid-cols-3 w-full">
            <div>
              <label
                class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
                for="budget"
              >
                Budget:
              </label>
              <input
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                type="number"
                onChange$={(event) =>
                  (store.event.budget = +(event.target as HTMLInputElement)
                    .value)
                }
                value={store.event.budget}
              ></input>
            </div>
            <div>
              <label
                class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
                for="headcount"
              >
                Headcount:
              </label>
              <input
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                type="number"
                onChange$={(event) =>
                  (store.event.headcount = +(event.target as HTMLInputElement)
                    .value)
                }
                value={store.event?.headcount}
              ></input>
            </div>
            <div>
              <label
                class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
                for="eventType"
              >
                Event type:
              </label>
              <select
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                id="eventType"
                name="eventType"
                onClick$={(event) =>
                  (store.event.type = (event.target as HTMLInputElement)
                    .value as EventType)
                }
              >
                <option value="" selected disabled hidden>
                  {store.event.type}
                </option>
                <option value="WEDDING">WEDDING</option>
                <option value="GRADUATION">GRADUATION</option>
                <option value="PARTY">PARTY</option>
                <option value="CONFERENCE">CONFERENCE</option>
                <option value="EXHIBITION">EXHIBITION</option>
                <option value="CUSTOM">CUSTOM</option>
              </select>
            </div>
          </div>
          <div class="grid gap-6 mb-6 md:grid-cols-2 w-full">
            <div>
              <label
                class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
                for="startDate"
              >
                Start Date:
              </label>
              <input
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                type="date"
                onChange$={(event) => {
                  const inputs = (event.target as HTMLInputElement).value.split(
                    "-"
                  );
                  store.event.startDate = new Date(
                    +inputs[0],
                    +inputs[1] - 1, // Starts from zero
                    +inputs[2],
                    store.event.startDate?.getHours(),
                    store.event.startDate?.getMinutes()
                  );
                  console.log(store.event.startDate);
                }}
                value={getProperDateFormat(store.event?.startDate)}
              ></input>
            </div>
            <div>
              <label
                class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
                for="startTime"
              >
                Start Time:
              </label>
              <input
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                type="time"
                onChange$={(event) => {
                  const inputs = (event.target as HTMLInputElement).value.split(
                    ":"
                  );
                  store.event.startDate = new Date(
                    store.event.startDate?.getFullYear() ?? 0,
                    store.event.startDate?.getMonth() ?? 0,
                    store.event.startDate?.getDate(),
                    +inputs[0],
                    +inputs[1] -
                      (store.event.startDate?.getTimezoneOffset() ?? 0)
                  );
                  console.log(store.event.startDate);
                }}
                value={getProperTimeFormat(store.event?.startDate)}
              ></input>
            </div>
            <div>
              <label
                class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
                for="endDate"
              >
                End Date:
              </label>
              <input
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                type="date"
                onChange$={(event) => {
                  const inputs = (event.target as HTMLInputElement).value.split(
                    "-"
                  );
                  store.event.endDate = new Date(
                    +inputs[0],
                    +inputs[1] - 1, // Starts from zero
                    +inputs[2],
                    store.event.endDate?.getHours(),
                    store.event.endDate?.getMinutes()
                  );
                }}
                value={getProperDateFormat(store.event?.endDate)}
              ></input>
            </div>
            <div>
              <label
                class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
                for="time"
              >
                End Time:
              </label>
              <input
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                type="time"
                onChange$={(event) => {
                  const inputs = (event.target as HTMLInputElement).value.split(
                    ":"
                  );
                  store.event.endDate = new Date(
                    store.event.endDate?.getFullYear() ?? 0,
                    store.event.endDate?.getMonth() ?? 0,
                    store.event.endDate?.getDate(),
                    +inputs[0],
                    +inputs[1] - (store.event.endDate?.getTimezoneOffset() ?? 0)
                  );
                }}
                value={getProperTimeFormat(store.event?.endDate)}
              ></input>
            </div>
          </div>
          <div class="grid gap-6 mb-6 md:grid-cols-3 w-full">
            <div>
              <label
                class="mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
                for="Menu"
              >
                Menu:
              </label>
              <input
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                type="checkbox"
                onChange$={(event) =>
                  (store.event.menuNeeded = (
                    event.target as HTMLInputElement
                  ).checked)
                }
                checked={store.event?.menuNeeded}
              ></input>
            </div>
            <div>
              <label
                class="mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
                for="decor"
              >
                Decor:
              </label>
              <input
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                type="checkbox"
                onChange$={(event) =>
                  (store.event.decorNeeded = (
                    event.target as HTMLInputElement
                  ).checked)
                }
                checked={store.event?.decorNeeded}
              ></input>
            </div>
            <div>
              <label
                class="mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
                for="performer"
              >
                Performer:
              </label>
              <input
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                type="checkbox"
                onChange$={(event) =>
                  (store.event.performerNeeded = (
                    event.target as HTMLInputElement
                  ).checked)
                }
                checked={store.event?.performerNeeded}
              ></input>
            </div>
          </div>
        </div>
        <div>
          <iframe
            src={`https://www.google.com/maps?q=${store.location.city}+${
              store.location.zipCode
                ? store.location.zipCode.toString() + "+"
                : ""
            }+${store.location.street.split(" ").join("+")}&output=embed`}
            style="border:0;"
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            class="w-[95%] h-[95%] float-right"
          ></iframe>
        </div>
      </div>
      {/* Buttons */}
      <div class="mb-12 relative overflow-x-auto sm:rounded-lg">
        <table class="w-full text-sm text-center">
          <tbody>
            <tr>
              <td>
                <button
                  class="w-full mt-6 mr-2 text-white bg-green-700 hover:bg-green-800 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-blue-300 font-medium rounded-lg text-sm sm:w-auto px-5 py-2.5 text-center dark:focus:ring-green-800"
                  preventdefault:click
                  onClick$={async () => {
                    if (store.event) {
                      const result = await client.updateEvent.mutate({
                        id: location.params.eventId,
                        userEmail: store.event.userEmail,
                        budget: store.event.budget,
                        startDate: getDateOrUndefined(store.event.startDate),
                        endDate: getDateOrUndefined(store.event.endDate),
                        headcount: store.event.headcount ?? undefined,
                        locationId: store.event.locationId,
                        name: store.event.name,
                        type: store.event.type,
                        decorNeeded: store.event.decorNeeded,
                        menuNeeded: store.event.menuNeeded,
                        performerNeeded: store.event.performerNeeded,
                      });

                      if (result.status === Status.SUCCESS) {
                        const toast = document.getElementById("successToast3");
                        if (toast) {
                          toast.classList.remove("hidden");
                        }
                      } else {
                        const toast = document.getElementById("failedToast");
                        if (toast) {
                          toast.classList.remove("hidden");
                        }
                      }
                    }
                  }}
                >
                  Save
                </button>
              </td>
              <td>
                <button
                  data-modal-target="deleteEventModal"
                  data-modal-toggle="deleteEventModal"
                  class="mt-6 mr-2 text-white bg-green-700 hover:bg-green-800 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-5 py-2.5 text-centerdark:focus:ring-green-800"
                  type="button"
                >
                  Delete
                </button>
              </td>
              <td>
                {" "}
                <button
                  class="mt-6 mr-2 text-white bg-green-700 hover:bg-green-800 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-5 py-2.5 text-centerdark:focus:ring-green-800"
                  preventdefault:click
                  onClick$={async () => {
                    exportToCalendar(store);
                  }}
                >
                  Export to Calendar
                </button>
              </td>
              <td>
                {" "}
                <button
                  class="mt-6 mr-2 text-white bg-green-700 hover:bg-green-800 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-5 py-2.5 text-centerdark:focus:ring-green-800"
                  onClick$={() =>
                    navigate(paths.location + store.event.locationId)
                  }
                >
                  Go to Location
                </button>
              </td>
              <td>
                {" "}
                <button
                  data-tooltip-target="tooltip-click"
                  data-tooltip-trigger="click"
                  type="button"
                  class="mt-6 mr-2 text-white bg-green-700 hover:bg-green-800 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-5 py-2.5 text-centerdark:focus:ring-green-800"
                >
                  Copy Feedback URL
                </button>
              </td>
              <td>
                {" "}
                <button
                  data-modal-target="guestlistModal"
                  data-modal-toggle="guestlistModal"
                  class="mt-6 mr-2 text-white bg-green-700 hover:bg-green-800 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-5 py-2.5 text-centerdark:focus:ring-green-800"
                  type="button"
                >
                  Show Guestlist
                </button>
              </td>
              <td>
                <button
                  data-modal-target="feedbackModal"
                  data-modal-toggle="feedbackModal"
                  class="mt-6 mr-2 text-white bg-green-700 hover:bg-green-800 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-5 py-2.5 text-centerdark:focus:ring-green-800"
                  type="button"
                >
                  Show Feedbacks
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <Modal
          id="deleteEventModal"
          listType="active-event"
          size="max-w-xl"
          type="popup"
          listTypeId={location.params.eventId}
          name="Are you sure you want to delete this event?"
        />

        <div
          id="tooltip-click"
          role="tooltip"
          class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
        >
          Copied
          <div class="tooltip-arrow" data-popper-arrow></div>
        </div>
        <Modal
          id="guestlistModal"
          name="Guestlist"
          size="max-w-8xl"
          listType="active-event"
          type=""
        >
          <GuestList
            userEmail={store.userEmail}
            openedFromEvent={true}
            eventId={location.params.eventId}
          />
        </Modal>
        <Modal
          id="feedbackModal"
          name="Feedbacks"
          size="max-w-8xl"
          listType="active-event"
          type=""
        >
          <Resource
            value={resource}
            onPending={() => <div>Loading...</div>}
            onResolved={(result: GetFeedbackReturnType) => {
              return (
                <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                  {result.feedbacks.length > 0 ? (
                    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr class="border-b border-neutral-700 bg-violet-900 text-neutral-50 dark:border-neutral-600 dark:bg-neutral-700">
                          <th scope="col" class="px-6 py-4">
                            First name
                          </th>
                          <th scope="col" class="px-6 py-4">
                            Last name
                          </th>
                          <th scope="col" class="px-6 py-4">
                            Email
                          </th>
                          <th scope="col" class="px-6 py-4">
                            Diabetes
                          </th>
                          <th scope="col" class="px-6 py-4">
                            Gluten
                          </th>
                          <th scope="col" class="px-6 py-4">
                            Lactose
                          </th>
                          <th scope="col" class="px-6 py-4">
                            Plus One
                          </th>
                          <th scope="col" class="px-6 py-4">
                            Additional information
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.feedbacks.map((feedback) => {
                          return (
                            <tr class="border-b dark:bg-gray-800 bg-slate-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                              <td
                                scope="row"
                                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                              >
                                {feedback.firstname}
                              </td>
                              <td
                                scope="row"
                                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                              >
                                {feedback.lastname}
                              </td>
                              <td
                                scope="row"
                                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                              >
                                {feedback.guestEmail}
                              </td>
                              <td
                                scope="row"
                                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                              >
                                <input
                                  type="checkbox"
                                  disabled
                                  checked={feedback.diabetes}
                                ></input>
                              </td>
                              <td
                                scope="row"
                                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                              >
                                <input
                                  type="checkbox"
                                  disabled
                                  checked={feedback.gluten}
                                ></input>
                              </td>
                              <td
                                scope="row"
                                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                              >
                                <input
                                  type="checkbox"
                                  disabled
                                  checked={feedback.lactose}
                                ></input>
                              </td>
                              <td
                                scope="row"
                                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                              >
                                <input
                                  type="checkbox"
                                  disabled
                                  checked={feedback.plusOne}
                                ></input>
                              </td>
                              <td
                                scope="row"
                                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                              >
                                {feedback.additional}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <h2 class="mb-6 text-3xl font-bold text-black dark:text-white text-center">
                      You have no feedbacks yet on this event! &#128565;
                    </h2>
                  )}
                </div>
              );
            }}
          />
        </Modal>
      </div>
      <div>
        <BudgetPlanning
          eventId={location.params.eventId}
          budget={store.event.budget}
          active={true}
        />
        {/* Menu */}
        {/* Decoration */}
      </div>
      <Toast
        id="successToast3"
        text="Operation Successful!"
        type="success"
        position="top-right"
      ></Toast>
      <Toast
        id="failedToast"
        text="Operation Failed!"
        type="failed"
        position="top-right"
      ></Toast>
    </div>
  );
});

export const onStaticGenerate: StaticGenerateHandler = async () => {
  const result = await client.getEvents.query({
    email: (await getUser()).data.user?.email ?? "",
  });

  return {
    params: result.events
      .filter((event) => event.startDate && event.startDate >= new Date())
      .map((event) => {
        const id = event.id;
        return {
          id,
        };
      }),
  };
};

export async function getCurrentEvent(eventId: string) {
  const result = await client.getEvent.query({ id: eventId });
  return result.event;
}

export const exportToCalendar = async (store: EventStore) => {
  if (!store.event?.startDate || !store.event?.endDate) {
    // TODO: tell the user to fill date field
    return;
  }
  const user = await client.getUser.query({
    email: store.userEmail,
  });
  const event: ics.EventAttributes = {
    start: [
      store.event?.startDate.getFullYear(),
      store.event?.startDate.getMonth(),
      store.event?.startDate.getDate(),
      store.event?.startDate.getHours(),
      store.event?.startDate.getMinutes(),
    ],
    end: [
      store.event?.endDate.getFullYear(),
      store.event?.endDate.getMonth(),
      store.event?.endDate.getDate(),
      store.event?.endDate.getHours(),
      store.event?.endDate.getMinutes(),
    ],
    title: store.event?.name,
    description: store.event?.type,
    location: store.location?.name,
    url: store.location.link?.startsWith("http")
      ? store.location?.link
      : "http://" + store.location?.link,
    // geo: { lat: 40.0095, lon: 105.2669 },
    status: "CONFIRMED",
    busyStatus: "BUSY",
    organizer: {
      name: user.user?.lastname + " " + user.user?.firstname,
      email: store.userEmail,
    },
    productId: store.event.name + "/ics",
  };

  await handleDownload(event, store.event?.name ?? "");
};

export async function handleDownload(
  event: ics.EventAttributes,
  eventName: string
) {
  const filename = eventName + ".ics";
  const file: Blob = await new Promise((resolve, reject) => {
    ics.createEvent(event, (error, value) => {
      if (error) {
        reject(error);
      }

      resolve(new File([value], filename, { type: "plain/text" }));
    });
  });
  const url = URL.createObjectURL(file);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
}
