import { component$, useStore, useBrowserVisibleTask$ } from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import type { StaticGenerateHandler } from "@builder.io/qwik-city";
import { client } from "~/utils/trpc";
import type { EventStore, LocationStore, NewEventStore } from "~/utils/types";
import { getUser } from "~/utils/supabase.client";
import { paths } from "~/utils/paths";
import { EventType } from "@prisma/client";
import { QwikModal } from "~/integrations/react/modal";
import { GuestList } from "~/components/guestlist/guestlist";
import * as ics from "ics";
import {
  getDateOrUndefined,
  getProperDateFormat,
  getProperTimeFormat,
} from "~/utils/common.functions";
import { BudgetPlanning } from "~/components/budget-planning/budget.planning";

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

  return (
    <div>
      <div>
        <label
          class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
          for="name"
        >
          Name:
        </label>
        <input
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          type="text"
          onChange$={(event) =>
            (store.event.name = (event.target as HTMLInputElement).value)
          }
          value={store.event?.name}
        ></input>
      </div>
      <div class="grid gap-6 mb-6 md:grid-cols-3 w-1/2">
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
              (store.event.budget = +(event.target as HTMLInputElement).value)
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
        </div>{" "}
      </div>
      <div class="grid gap-6 mb-6 md:grid-cols-2 w-1/2">
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
                +inputs[1] - (store.event.startDate?.getTimezoneOffset() ?? 0)
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
      <div class="grid gap-6 mb-6 md:grid-cols-3 w-1/2">
        <div>
          <label
            class="mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
            for="Menu"
          >
            Menu:
          </label>
          <input
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            type="checkbox"
            onChange$={(event) =>
              (store.event.performerNeeded = (
                event.target as HTMLInputElement
              ).checked)
            }
            checked={store.event?.performerNeeded}
          ></input>
        </div>{" "}
      </div>
      <button
        class="mt-6 mr-2 text-white bg-green-700 hover:bg-green-800 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-5 py-2.5 text-centerdark:focus:ring-green-800"
        onClick$={() => (store.modalOpen = true)}
      >
        Open Guestlist
      </button>
      <QwikModal
        client:load
        // @ts-ignore: Type is not assignable to type
        isOpen={store.modalOpen}
        className="bg-slate-300 dark:bg-gray-600 overflow-hidden absolute inset-10 rounded-2xl p-6"
      >
        <button
          class="mt-6 mr-2 text-white bg-green-700 hover:bg-green-800 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-5 py-2.5 text-centerdark:focus:ring-green-800"
          onClick$={() => (store.modalOpen = false)}
        >
          Close Guestlist
        </button>
        <GuestList
          userEmail={store.userEmail}
          openedFromEvent={true}
          eventId={location.params.eventId}
        />
      </QwikModal>
      <button
        class="mt-6 mr-2 text-white bg-green-700 hover:bg-green-800 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-5 py-2.5 text-centerdark:focus:ring-green-800"
        preventdefault:click
        onClick$={() => {
          if (store.event) {
            console.log(store.event.startDate);
            console.log(store.event.endDate);
            const x = {
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
            };
            console.log(x);
            client.updateEvent.mutate({
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
          }
        }}
      >
        Save
      </button>
      <button
        class="mt-6 mr-2 text-white bg-green-700 hover:bg-green-800 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-5 py-2.5 text-centerdark:focus:ring-green-800"
        preventdefault:click
        onClick$={() => {
          const result = window.prompt(
            "Do you really want to delete this event? (To do so, type yes)"
          );
          if (result?.toLowerCase() === "yes") {
            client.deleteEvent.mutate({
              id: location.params.eventId,
            });
            navigate(paths.events);
          }
        }}
      >
        Delete
      </button>
      <button
        class="mt-6 mr-2 text-white bg-green-700 hover:bg-green-800 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-5 py-2.5 text-centerdark:focus:ring-green-800"
        preventdefault:click
        onClick$={async () => {
          exportToCalendar(store);
        }}
      >
        Export to Calendar
      </button>
      <a
        target="_blank"
        href={`https://www.google.com/maps/search/?api=1&${store.location.city} ${store.location.street}`}
      >
        <button class="mt-6 mr-2 text-white bg-green-700 hover:bg-green-800 dark:bg-blue-700 dark:hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-blue-300 font-medium rounded-lg text-sm w-1/2 sm:w-auto px-5 py-2.5 text-centerdark:focus:ring-green-800">
          Show on Google Maps
        </button>
      </a>
      <div class="wrapper">
        <BudgetPlanning
          eventId={location.params.eventId}
          budget={store.event.budget}
          active={true}
        />
        {/* Menu */}
        {/* Decoration */}
      </div>
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
