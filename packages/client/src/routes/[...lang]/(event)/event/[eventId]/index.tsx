import {
  component$,
  Resource,
  useContext,
  useResource$,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { StaticGenerateHandler } from "@builder.io/qwik-city";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import { EventType } from "@prisma/client";
import { Status } from "event-organiser-api-server/src/status.enum";
import * as ics from "ics";
import { $translate as t, Speak } from "qwik-speak";
import { BudgetPlanning } from "~/components/budget-planning/budget.planning";
import { GuestList } from "~/components/guestlist/guestlist";
import Modal from "~/components/modal/modal";
import Toast from "~/components/toast/toast";
import { CTX } from "~/routes/[...lang]/layout";
import {
  generateGoogleMapsLink,
  generateRoutingLink,
  getCurrentEvent,
  getDateOrUndefined,
  getProperDateFormat,
  getProperTimeFormat,
} from "~/utils/common.functions";
import { paths } from "~/utils/paths";
import { client } from "~/utils/trpc";
import type {
  EventStore,
  GetFeedbackReturnType,
  LocationStore,
  NewEventStore,
  UserContext,
} from "~/utils/types";

export default component$(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useContext(CTX);

  const store = useStore<EventStore>({
    event: {
      budget: 0,
      endDate: new Date(),
      headcount: 0,
      locationId: location.params.eventId,
      name: "",
      startDate: new Date(),
      type: EventType.CUSTOM,
    },
    location: {
      addressId: "",
      city: "",
      countryId: 0,
      description: "",
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
    origin: "",
    feedbackTranslations: {
      firstname: t("common.firstname@@First name"),
      lastname: t("common.lastname@@Last name"),
      email: t("common.email@@Email"),
      diabetes: t("event.diabetes@@Diabetes"),
      gluten: t("event.gluten@@Gluten"),
      lactose: t("event.lactose@@Lactose"),
      plusOne: t("event.plusOne@@Plus one"),
      additional: t("event.additional@@Additional information"),
      noFeedbacks: t(
        "event.noFeedbacks@@You have no feedbacks yet on this event!"
      ),
    },
    loading: t("common.loading@@Loading..."),
  });

  useVisibleTask$(async () => {
    const event = await getCurrentEvent(location.params.eventId);
    if (event) {
      if (event.endDate && event.endDate < new Date()) {
        navigate(
          generateRoutingLink(
            location.params.lang,
            paths.previousEvent + location.params.eventId
          )
        );
      }

      const currentEvent: NewEventStore = {
        budget: +event.budget,
        startDate: event.startDate ?? undefined,
        endDate: event.endDate ?? undefined,
        headcount: event.headcount ?? undefined,
        locationId: event.locationId,
        name: event.name,
        type: event.type ?? undefined,
      };

      const currentLocation: LocationStore = {
        addressId: event.location.addressId,
        city: event.location.address.city,
        countryId: event.location.address.countryId,
        description: event.location.description ?? undefined,
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
      store.origin = document.location.origin;
    }
  });

  const resource = useResource$<GetFeedbackReturnType>(({ track, cleanup }) => {
    track(() => user.userEmail);
    const controller = new AbortController();
    cleanup(() => controller.abort());
    return client.getFeedbacks.query({ id: location.params.eventId });
  });

  return (
    <Speak assets={["event", "toast", "common"]}>
      <h1 class="mb-6 text-center text-3xl font-semibold text-black dark:text-white">
        {t("event.event@@Event")}
      </h1>
      <div class="grid gap-4 mb-6 md:grid-cols-2 w-full place-content-between">
        <div>
          <div>
            <label
              class="block mb-2 text-lg font-medium text-gray-900 dark:text-white"
              for="name"
            >
              {t("event.name@@Name:")}
            </label>
            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
              type="text"
              onChange$={(event) =>
                (store.event.name = (event.target as HTMLInputElement).value)
              }
              value={store.event?.name}
            ></input>
          </div>
          <div class="grid gap-6 md:grid-cols-3 w-full">
            <div>
              <label
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="budget"
              >
                {t("event.budget@@Budget:")}
              </label>
              <input
                class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
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
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="headcount"
              >
                {t("event.headcount@@Headcount:")}
              </label>
              <input
                class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
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
                  (store.event.type = (event.target as HTMLInputElement)
                    .value as EventType)
                }
              >
                <option value="" selected disabled hidden>
                  {store.event.type === "WEDDING"
                    ? t("event.wedding@@Wedding")
                    : store.event.type === "GRADUATION"
                    ? t("event.graduation@@Graduation")
                    : store.event.type === "PARTY"
                    ? t("event.party@@Party")
                    : store.event.type === "CONFERENCE"
                    ? t("event.conference@@Conference")
                    : store.event.type === "EXHIBITION"
                    ? t("event.exhibition@@Exhibition")
                    : store.event.type === "CUSTOM"
                    ? t("event.custom@@Custom")
                    : ""}
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
          </div>
          <div class="grid gap-6 md:grid-cols-2 w-full">
            <div>
              <label
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="startDate"
              >
                {t("common.startDate@@Start Date:")}
              </label>
              <input
                class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
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
                }}
                value={getProperDateFormat(store.event?.startDate)}
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
                }}
                value={getProperTimeFormat(store.event?.startDate)}
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
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="time"
              >
                {t("common.endTime@@End Time:")}
              </label>
              <input
                class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
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
        </div>
        <div>
          <iframe
            src={generateGoogleMapsLink(
              true,
              store.location.city,
              store.location.state,
              store.location.zipCode,
              store.location.street
            )}
            style="border:0;"
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            class="w-[95%] h-[95%] float-right"
          ></iframe>
        </div>
      </div>
      {/* Buttons */}
      <div class="p-6 relative overflow-x-auto sm:rounded-lg">
        <table class="w-full text-sm text-center">
          <tbody>
            <tr>
              <td>
                <button
                  class="mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
                  preventdefault:click
                  onClick$={async () => {
                    if (store.event) {
                      const result = await client.updateEvent.mutate({
                        id: location.params.eventId,
                        userEmail: user.userEmail,
                        budget: store.event.budget,
                        startDate: getDateOrUndefined(store.event.startDate),
                        endDate: getDateOrUndefined(store.event.endDate),
                        headcount: store.event.headcount ?? undefined,
                        locationId: store.event.locationId,
                        name: store.event.name,
                        type: store.event.type
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
                  {t("common.save@@Save")}
                </button>
              </td>
              <td>
                <button
                  data-modal-target="deleteEventModal"
                  data-modal-toggle="deleteEventModal"
                  class="mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
                  type="button"
                >
                  {t("common.delete@@Delete")}
                </button>
              </td>
              <td>
                <button
                  class="mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
                  preventdefault:click
                  onClick$={() => {
                    exportToCalendar(store, user);
                  }}
                >
                  {t("event.exportToCalendar@@Export to Calendar")}
                </button>
              </td>
              <td>
                <button
                  class="mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
                  onClick$={() =>
                    navigate(
                      generateRoutingLink(
                        location.params.lang,
                        paths.location + store.event.locationId
                      )
                    )
                  }
                >
                  {t("event.goToLocation@@Go to Location")}
                </button>
              </td>
              <td>
                <a
                  target="_blank"
                  href={store.origin + paths.feedback + location.params.eventId}
                >
                  <button
                    type="button"
                    class="mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
                  >
                    {t("event.openFeedback@@Open Feedback Page")}
                  </button>
                </a>
              </td>
              <td>
                <a
                  target="_blank"
                  href={generateGoogleMapsLink(
                    false,
                    store.location.city,
                    store.location.state,
                    store.location.zipCode,
                    store.location.street
                  )}
                >
                  <button
                    type="button"
                    class="mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
                  >
                    {t("event.showInGoogleMaps@@Show in Google Maps")}
                  </button>
                </a>
              </td>
              <td>
                <button
                  data-modal-target="guestlistModal"
                  data-modal-toggle="guestlistModal"
                  class="mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
                  type="button"
                >
                  {t("event.showGuestlist@@Show Guestlist")}
                </button>
              </td>
              <td>
                <button
                  data-modal-target="feedbackModal"
                  data-modal-toggle="feedbackModal"
                  class="mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
                  type="button"
                >
                  {t("event.showFeedbacks@@Show Feedbacks")}
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
          name={t(
            "event.deleteEvent@@Are you sure you want to delete this event?"
          )}
        />
        <Modal
          id="guestlistModal"
          name={t("event.guestlist@@Guestlist")}
          size=""
          listType="active-event"
          type=""
        >
          <GuestList openedFromEvent={true} eventId={location.params.eventId} />
        </Modal>
        <Modal
          id="feedbackModal"
          name={t("event.feedbacks@@Feedbacks")}
          size="max-w-8xl"
          listType="active-event"
          type=""
        >
          <Resource
            value={resource}
            onPending={() => <div>{store.loading}</div>}
            onResolved={(result: GetFeedbackReturnType) => {
              return (
                <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                  {result.feedbacks.length > 0 ? (
                    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr class="border-b border-neutral-700 bg-violet-900 text-neutral-50 dark:border-neutral-600 dark:bg-neutral-700">
                          <th scope="col" class="px-6 py-4">
                            {store.feedbackTranslations.firstname}
                          </th>
                          <th scope="col" class="px-6 py-4">
                            {store.feedbackTranslations.lastname}
                          </th>
                          <th scope="col" class="px-6 py-4">
                            {store.feedbackTranslations.email}
                          </th>
                          <th scope="col" class="px-6 py-4">
                            {store.feedbackTranslations.diabetes}
                          </th>
                          <th scope="col" class="px-6 py-4">
                            {store.feedbackTranslations.gluten}
                          </th>
                          <th scope="col" class="px-6 py-4">
                            {store.feedbackTranslations.lactose}
                          </th>
                          <th scope="col" class="px-6 py-4">
                            {store.feedbackTranslations.plusOne}
                          </th>
                          <th scope="col" class="px-6 py-4">
                            {store.feedbackTranslations.additional}
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
                                  class="min-w-4 min-h-4 dark:text-blue-600 bg-gray-300 border-gray-300 rounded dark:focus:ring-blue-500 text-green-800 focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-900 dark:border-gray-600"
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
                                  class="min-w-4 min-h-4 dark:text-blue-600 bg-gray-300 border-gray-300 rounded dark:focus:ring-blue-500 text-green-800 focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-900 dark:border-gray-600"
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
                                  class="min-w-4 min-h-4 dark:text-blue-600 bg-gray-300 border-gray-300 rounded dark:focus:ring-blue-500 text-green-800 focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-900 dark:border-gray-600"
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
                                  class="min-w-4 min-h-4 dark:text-blue-600 bg-gray-300 border-gray-300 rounded dark:focus:ring-blue-500 text-green-800 focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-900 dark:border-gray-600"
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
                      {store.feedbackTranslations.noFeedbacks}
                      &#128565;
                    </h2>
                  )}
                </div>
              );
            }}
          />
        </Modal>
      </div>
      <div>
        <label
          class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
          for="budgetPlanning"
        >
          {t("event.budgetPlanning@@Budget Planning:")}
        </label>
        <BudgetPlanning
          eventId={location.params.eventId}
          budget={store.event.budget}
          active={true}
        />
      </div>
      <Toast
        id="successToast3"
        text={t("toast.operationSuccessful@@Operation Successful!")}
        type="success"
        position="top-right"
      ></Toast>
      <Toast
        id="failedToast"
        text={t("toast.operationFailed@@Operation Failed!")}
        type="failed"
        position="top-right"
      ></Toast>
    </Speak>
  );
});

export const onStaticGenerate: StaticGenerateHandler = async () => {
  const user = useContext(CTX);

  const result = await client.getEvents.query({
    email: user.userEmail,
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

export const exportToCalendar = async (
  store: EventStore,
  user: UserContext
) => {
  if (!store.event?.startDate || !store.event?.endDate) {
    // TODO: tell the user to fill date field
    return;
  }

  const event: ics.EventAttributes = {
    start: [
      store.event?.startDate.getFullYear(),
      store.event?.startDate.getMonth() + 1,
      store.event?.startDate.getDate(),
      store.event?.startDate.getHours() +
        store.event.startDate.getTimezoneOffset() / 60,
      store.event?.startDate.getMinutes(),
    ],
    end: [
      store.event?.endDate.getFullYear(),
      store.event?.endDate.getMonth() + 1,
      store.event?.endDate.getDate(),
      store.event?.endDate.getHours() +
        store.event.endDate.getTimezoneOffset() / 60,
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
      name: user?.lastname + " " + user?.firstname,
      email: user.userEmail,
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