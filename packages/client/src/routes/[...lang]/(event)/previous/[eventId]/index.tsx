import {
  component$,
  Resource,
  useVisibleTask$,
  useResource$,
  useSignal,
  useContext,
} from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import type { StaticGenerateHandler } from "@builder.io/qwik-city";
import { client } from "~/utils/trpc";
import type { NewEventStore, GetGuestReturnType } from "~/utils/types";
import { paths } from "~/utils/paths";
import {
  generateRoutingLink,
  getCurrentEvent,
  getProperDateFormat,
  getProperTimeFormat,
} from "~/utils/common.functions";
import { BudgetPlanning } from "~/components/budget-planning/budget.planning";
import Modal from "~/components/modal/modal";
import { $translate as t, Speak } from "qwik-speak";
import { CTX } from "~/routes/[...lang]/layout";

export default component$(() => {
  const { params } = useLocation();
  const newEventStore = useSignal<NewEventStore>();
  const navigate = useNavigate();
  const user = useContext(CTX);
  const loading = useSignal<string>(t("common.loading@@Loading..."));

  useVisibleTask$(async () => {
    const event = await getCurrentEvent(params.eventId);
    if (event) {
      if (event.endDate != null && event.endDate >= new Date()) {
        navigate(
          generateRoutingLink(params.lang, paths.event + params.eventId)
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

      newEventStore.value = currentEvent;
    }
  });

  const resource = useResource$<GetGuestReturnType>(({ track, cleanup }) => {
    track(() => user.userEmail);
    const controller = new AbortController();
    cleanup(() => controller.abort());
    return client.getGuests.query({
      userEmail: user.userEmail,
      filteredByEvent: true,
      eventId: params.eventId,
    });
  });

  return (
    <Speak assets={["event", "common"]}>
      <h1 class="mb-6 text-center text-3xl font-semibold text-black dark:text-white">
        {t("event.previousEvent@@Previous Event")}
      </h1>
      <h1 class="mb-6 text-xl font-bold text-black dark:text-white">
        {t("event.cannotBeModified@@Previous events cannot be modified!")}
      </h1>
      <div class="grid grid-cols-2">
        <div>
          <label
            class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
            for="name"
          >
            {t("event.eventName@@Event Name:")}
          </label>
          <input
            class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
            readOnly
            type="text"
            value={newEventStore.value?.name}
          ></input>
          <div class="grid gap-6 md:grid-cols-3 w-full">
            <div>
              <label
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="type"
              >
                {t("event.eventType@@Event Type:")}
              </label>
              <input
                class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
                readOnly
                type="text"
                value={
                  newEventStore.value?.type === "WEDDING"
                    ? t("event.wedding@@Wedding")
                    : newEventStore.value?.type === "GRADUATION"
                    ? t("event.graduation@@Graduation")
                    : newEventStore.value?.type === "PARTY"
                    ? t("event.party@@Party")
                    : newEventStore.value?.type === "CONFERENCE"
                    ? t("event.conference@@Conference")
                    : newEventStore.value?.type === "EXHIBITION"
                    ? t("event.exhibition@@Exhibition")
                    : newEventStore.value?.type === "CUSTOM"
                    ? t("event.custom@@Custom")
                    : ""
                }
              ></input>
            </div>
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
                readOnly
                value={newEventStore.value?.budget}
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
                readOnly
                type="number"
                value={newEventStore.value?.headcount}
              ></input>
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
                readOnly
                type="date"
                value={getProperDateFormat(newEventStore.value?.startDate)}
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
                readOnly
                type="time"
                value={getProperTimeFormat(newEventStore.value?.startDate)}
              ></input>
            </div>
            <div>
              <label
                class="block mb-2 text-lg font-medium text-gray-900 dark:text-white"
                for="endDate"
              >
                {t("common.endDate@@End Date:")}
              </label>
              <input
                class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
                readOnly
                type="date"
                value={getProperDateFormat(newEventStore.value?.endDate)}
              ></input>
            </div>
            <div>
              <label
                class="block mb-2 text-lg font-medium text-gray-900 dark:text-white"
                for="endTime"
              >
                {t("common.endTime@@End Time:")}
              </label>
              <input
                class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
                readOnly
                type="time"
                value={getProperTimeFormat(newEventStore.value?.endDate)}
              ></input>
            </div>
          </div>
        </div>
        <div class="place-self-center self-start">
          <Resource
            value={resource}
            onPending={() => <div>{loading.value}</div>}
            onResolved={(result: GetGuestReturnType) => {
              return (
                <div>
                  {result.guests.length === 0 ? (
                    ""
                  ) : (
                    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                      <label
                        class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                        for="guestlist"
                      >
                        {t("event.guestlist@@Guestlist:")}
                      </label>
                      <table class="w-1/2 text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                          <tr class="border-b border-neutral-700 bg-violet-900 text-neutral-50 dark:border-neutral-600 dark:bg-neutral-700">
                            <th scope="col" class="px-6 py-4">
                              {t("common.firstname@@First name")}
                            </th>
                            <th scope="col" class="px-6 py-4">
                              {t("common.lastname@@Last name")}
                            </th>
                            <th scope="col" class="px-6 py-4">
                              {t("common.email@@Email")}
                            </th>
                            <th scope="col" class="px-6 py-4">
                              {t("event.specialNeeds@@Special needs")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.guests.map((guest) => {
                            return (
                              <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td
                                  scope="row"
                                  class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                >
                                  {guest.firstname}
                                </td>
                                <td
                                  scope="row"
                                  class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                >
                                  {guest.lastname}
                                </td>
                                <td
                                  scope="row"
                                  class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                >
                                  {guest.email}
                                </td>
                                <td
                                  scope="row"
                                  class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                >
                                  {guest.description}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            }}
          />
        </div>
      </div>
      <label
        class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
        for="budgetPlanning"
      >
        {t("event.budgetPlanning@@Budget Planning:")}
      </label>
      <BudgetPlanning
        active={false}
        budget={newEventStore.value?.budget ?? 0}
        eventId={params.eventId}
      />
      <button
        data-modal-target="deleteModal"
        data-modal-toggle="deleteModal"
        class="mt-6 mr-2 text-white bg-green-700 hover:bg-green-800 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-5 py-2.5 text-centerdark:focus:ring-green-800"
        type="button"
      >
        {t("common.delete@@Delete")}
      </button>
      <Modal
        id="deleteModal"
        listType="previous-event"
        size="max-w-xl"
        type="popup"
        listTypeId={params.eventId}
        name={t(
          "event.deleteEvent@@Are you sure you want to delete this event?"
        )}
      />
      <button
        class="mt-6 mr-2 text-white bg-green-700 hover:bg-green-800 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-5 py-2.5 text-centerdark:focus:ring-green-800"
        preventdefault:click
        onClick$={() => {
          navigate(
            generateRoutingLink(
              params.lang,
              paths.location + newEventStore.value?.locationId
            )
          );
        }}
      >
        {t("event.locationCard@@Location Card")}
      </button>
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
      .filter(
        (event) => event.startDate != null && event.startDate < new Date()
      )
      .map((event) => {
        const id = event.id;
        return {
          id,
        };
      }),
  };
};
