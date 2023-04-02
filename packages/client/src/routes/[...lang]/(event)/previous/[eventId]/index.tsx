import {
  component$,
  Resource,
  useVisibleTask$,
  useResource$,
  useSignal,
  useContext,
  useStore,
} from "@builder.io/qwik";
import { useLocation, useNavigate, type DocumentHead } from "@builder.io/qwik-city";
import type { StaticGenerateHandler } from "@builder.io/qwik-city";
import { client } from "~/utils/trpc";
import type {
  NewEventStore,
  GetGuestReturnType,
  GuestTranslations,
} from "~/utils/types";
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
  const guestTranslations = useStore<GuestTranslations>({
    email: t("common.email@@Email"),
    firstname: t("common.firstname@@First name"),
    lastname: t("common.lastname@@Last name"),
    specialNeeds: t("event.specialNeeds@@Special needs"),
  });

  useVisibleTask$(async () => {
    const event = await getCurrentEvent(params.eventId);
    if (event) {
      if (event.endDate != null && event.endDate >= new Date()) {
        navigate(
          generateRoutingLink(params.lang, paths.event + params.eventId),
          true
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
    return client.getPreviousGuests.query({
      userEmail: user.userEmail ?? "",
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
            class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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
                class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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
                class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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
                class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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
                class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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
                class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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
                class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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
                class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                readOnly
                type="time"
                value={getProperTimeFormat(newEventStore.value?.endDate)}
              ></input>
            </div>
          </div>
        </div>
        <Modal
          id="previous-event-guests-modal"
          listType="previous-event"
          name={t("event.guestlist@@Guestlist")}
          size="max-w-8xl"
          type=""
        >
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
                      <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400 overflow-auto">
                        <thead class="text-md bg-sky-700 text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
                          <tr class="text-neutral-50 dark:bg-black">
                            <th scope="col" class="px-6 py-4">
                              {guestTranslations.firstname}
                            </th>
                            <th scope="col" class="px-6 py-4">
                              {guestTranslations.lastname}
                            </th>
                            <th scope="col" class="px-6 py-4">
                              {guestTranslations.email}
                            </th>
                            <th scope="col" class="px-6 py-4">
                              {guestTranslations.specialNeeds}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.guests.map((guest) => {
                            return (
                              <tr class="bg-slate-50 border-b border-gray-300 dark:bg-gray-800 dark:border-gray-700 hover:bg-slate-200 dark:hover:bg-gray-700">
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
        </Modal>
      </div>
      <button
        data-modal-target="deleteModal"
        data-modal-toggle="deleteModal"
        class="mt-6 mr-2 text-white bg-sky-600 hover:bg-sky-700 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-700 dark:hover:bg-blue-600"
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
        class="mt-6 mr-2 text-white bg-sky-600 hover:bg-sky-700 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-700 dark:hover:bg-blue-600"
        preventdefault:click
        onClick$={() => {
          navigate(
            generateRoutingLink(
              params.lang,
              paths.location + newEventStore.value?.locationId
            ),
            true
          );
        }}
      >
        {t("event.locationCard@@Location Card")}
      </button>
      <button
        data-modal-target="previous-event-guests-modal"
        data-modal-toggle="previous-event-guests-modal"
        class="mt-6 mr-2 text-white bg-sky-600 hover:bg-sky-700 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-700 dark:hover:bg-blue-600"
        type="button"
      >
        {t("event.showGuestlist@@Show Guestlist")}
      </button>
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
    </Speak>
  );
});

export const onStaticGenerate: StaticGenerateHandler = async () => {
  const user = useContext(CTX);
  const result = await client.getEvents.query({
    email: user.userEmail ?? "",
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

export const head: DocumentHead = {
  title: 'Previous Event',
};