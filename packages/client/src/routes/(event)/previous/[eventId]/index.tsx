import {
  component$,
  Resource,
  useBrowserVisibleTask$,
  useResource$,
  useSignal,
} from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import type { StaticGenerateHandler } from "@builder.io/qwik-city";
import { client } from "~/utils/trpc";
import type { NewEventStore, GetGuestReturnType } from "~/utils/types";
import { getUser } from "~/utils/supabase.client";
import { paths } from "~/utils/paths";
import {
  getProperDateFormat,
  getProperTimeFormat,
} from "~/utils/common.functions";
import { BudgetPlanning } from "~/components/budget-planning/budget.planning";
import Modal from "~/components/modal/modal";

export default component$(() => {
  const { params } = useLocation();
  const newEventStore = useSignal<NewEventStore>();
  const navigate = useNavigate();
  const userEmail = useSignal<string>("");

  useBrowserVisibleTask$(async () => {
    const userDetails = await getUser();
    if (!userDetails.data.user) {
      navigate(paths.login);
    }

    userEmail.value = userDetails.data.user?.email ?? "";
    const event = await getCurrentEvent(params.eventId);
    if (event) {
      if (event.endDate != null && event.endDate >= new Date()) {
        navigate(paths.event + params.eventId);
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
      console.log(params);

      newEventStore.value = currentEvent;
    }
  });

  const resource = useResource$<GetGuestReturnType>(({ track, cleanup }) => {
    track(() => userEmail.value);
    const controller = new AbortController();
    cleanup(() => controller.abort());
    return client.getGuests.query({
      userEmail: userEmail.value,
      filteredByEvent: true,
      eventId: params.eventId,
    });
  });

  return (
    <div>
      <h1 class="mb-6 text-3xl font-semibold text-black dark:text-white text-center">
        Previous events cannot be modified!
      </h1>
      <div class="grid grid-cols-2">
        <div>
          <label
            class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
            for="name"
          >
            Event Name:
          </label>
          <input
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            readOnly
            type="text"
            value={newEventStore.value?.name}
          ></input>
          <div class="grid gap-6 mb-6 md:grid-cols-3 w-full">
            <div>
              <label
                class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
                for="type"
              >
                Event Type:
              </label>
              <input
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                readOnly
                type="text"
                value={newEventStore.value?.type}
              ></input>
            </div>
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
                readOnly
                value={newEventStore.value?.budget}
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
                readOnly
                type="number"
                value={newEventStore.value?.headcount}
              ></input>
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
                readOnly
                type="date"
                value={getProperDateFormat(newEventStore.value?.startDate)}
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
                readOnly
                type="time"
                value={getProperTimeFormat(newEventStore.value?.startDate)}
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
                readOnly
                type="date"
                value={getProperDateFormat(newEventStore.value?.endDate)}
              ></input>
            </div>
            <div>
              <label
                class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
                for="endTime"
              >
                End Time:
              </label>
              <input
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
            onPending={() => <div>Loading...</div>}
            onResolved={(result: GetGuestReturnType) => {
              return (
                <div>
                  {result.guests.length === 0 ? (
                    ""
                  ) : (
                    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                      <label
                        class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
                        for="guestlist"
                      >
                        Guestlist:
                      </label>
                      <table class="w-1/2 text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                          <tr class="border-b border-neutral-700 bg-violet-900 text-neutral-50 dark:border-neutral-600 dark:bg-neutral-700">
                            <th scope="col" class="px-6 py-4">
                              Firstname
                            </th>
                            <th scope="col" class="px-6 py-4">
                              Lastname
                            </th>
                            <th scope="col" class="px-6 py-4">
                              Email
                            </th>
                            <th scope="col" class="px-6 py-4">
                              Special Needs
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
        class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
        for="budgetPlanning"
      >
        Budget Planning:
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
        Delete
      </button>
      <Modal
        id="deleteModal"
        listType="previous-event"
        size="max-w-xl"
        type="popup"
        listTypeId={params.eventId}
        name="Are you sure you want to delete this event?"
      />
      <button
        class="mt-6 mr-2 text-white bg-green-700 hover:bg-green-800 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-5 py-2.5 text-centerdark:focus:ring-green-800"
        preventdefault:click
        onClick$={() => {
          navigate(paths.location + newEventStore.value?.locationId);
        }}
      >
        Location Card
      </button>
    </div>
  );
});

export const onStaticGenerate: StaticGenerateHandler = async () => {
  const result = await client.getEvents.query({
    email: (await getUser()).data.user?.email ?? "",
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

export async function getCurrentEvent(eventId: string) {
  const result = await client.getEvent.query({ id: eventId });
  return result.event;
}
