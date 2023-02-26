import {
  component$,
  useClientEffect$,
  useStore,
  useStyles$,
} from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import type { StaticGenerateHandler } from "@builder.io/qwik-city";
import { client } from "~/utils/trpc";
import type { EventStore, LocationStore, NewEventStore } from "~/utils/types";
import { getUser } from "~/utils/supabase.client";
import { paths } from "~/utils/paths";
import type { EventType } from "@prisma/client";
import { QwikModal } from "~/integrations/react/modal";
import styles from "~/table.css?inline";
import { GuestList } from "~/components/guestlist/guestlist";
import * as ics from "ics";
import {
  getProperDateFormat,
  getProperTimeFormat,
} from "~/utils/common.functions";

export default component$(() => {
  useStyles$(styles);

  const { params } = useLocation();
  const navigate = useNavigate();

  const store = useStore<EventStore>({
    modalOpen: false,
    userEmail: "",
  });

  useClientEffect$(async ({ track }) => {
    track(() => store.userEmail);
    const userDetails = await getUser();
    if (!userDetails.data.user) {
      navigate.path = paths.login;
    }

    store.userEmail = userDetails.data.user?.email ?? "";

    const event = await getCurrentEvent(params.eventId);
    if (event) {
      if (event.startDate < new Date()) {
        navigate.path = paths.previousEvent + params.eventId;
      }

      const currentEvent: NewEventStore = {
        budget: +event.budget,
        startDate: event.startDate,
        endDate: event.endDate,
        email: event.email,
        headcount: event.headcount,
        locationId: event.locationId,
        name: event.name,
        type: event.type,
      };

      const currentLocation: LocationStore = {
        addressId: event.location.addressId,
        city: event.location.address.city,
        countryId: event.location.address.countryId,
        description: event.location.description,
        email: event.location.email,
        link: event.location.link,
        name: event.location.name,
        phone: event.location.phone,
        price: +event.location.price,
        state: event.location.address.state,
        street: event.location.address.street,
        type: event.location.type,
        zipCode: +event.location.address.zip_code,
      };

      store.event = currentEvent;
      store.location = currentLocation;
    }
  });

  return (
    <div>
      <label for="budget">Budget:</label>
      <input
        type="number"
        onChange$={(event) =>
          (store.event!.budget = +(event.target as HTMLInputElement).value)
        }
        value={store.event?.budget}
      ></input>
      <label for="startDate">Start Date:</label>
      <input
        type="date"
        onChange$={(event) => {
          const inputs = (event.target as HTMLInputElement).value.split("-");
          store.event!.startDate = new Date(
            +inputs[0],
            +inputs[1] - 1, // Starts from zero
            +inputs[2],
            store.event!.startDate.getHours(),
            store.event!.startDate.getMinutes()
          );
          console.log(store.event!.startDate);
        }}
        value={getProperDateFormat(store.event?.startDate)}
      ></input>
      <label for="startTime">Start Time:</label>
      <input
        type="time"
        onChange$={(event) => {
          const inputs = (event.target as HTMLInputElement).value.split(":");
          store.event!.startDate = new Date(
            store.event!.startDate.getFullYear(),
            store.event!.startDate.getMonth(),
            store.event!.startDate.getDate(),
            +inputs[0],
            +inputs[1] - store.event!.startDate.getTimezoneOffset()
          );
          console.log(store.event!.startDate);
        }}
        value={getProperTimeFormat(store.event?.startDate)}
      ></input>
      <label for="endDate">End Date:</label>
      <input
        type="date"
        onChange$={(event) => {
          const inputs = (event.target as HTMLInputElement).value.split("-");
          store.event!.endDate = new Date(
            +inputs[0],
            +inputs[1] - 1, // Starts from zero
            +inputs[2],
            store.event!.endDate.getHours(),
            store.event!.endDate.getMinutes()
          );
        }}
        value={getProperDateFormat(store.event?.endDate)}
      ></input>
      <label for="time">End Time:</label>
      <input
        type="time"
        onChange$={(event) => {
          const inputs = (event.target as HTMLInputElement).value.split(":");
          store.event!.endDate = new Date(
            store.event!.endDate.getFullYear(),
            store.event!.endDate.getMonth(),
            store.event!.endDate.getDate(),
            +inputs[0],
            +inputs[1] - store.event!.endDate.getTimezoneOffset()
          );
        }}
        value={getProperTimeFormat(store.event?.endDate)}
      ></input>
      <label for="headcount">Headcount:</label>
      <input
        type="number"
        onChange$={(event) =>
          (store.event!.headcount = +(event.target as HTMLInputElement).value)
        }
        value={store.event?.headcount}
      ></input>
      <label for="name">Name:</label>
      <input
        type="text"
        onChange$={(event) =>
          (store.event!.name = (event.target as HTMLInputElement).value)
        }
        value={store.event?.name}
      ></input>
      <label for="eventType">Event type:</label>
      <select
        id="eventType"
        name="eventType"
        onClick$={(event) =>
          (store.event!.type = (event.target as HTMLInputElement)
            .value as EventType)
        }
      >
        <option value="" selected disabled hidden>
          {store.event!.type}
        </option>
        <option value="WEDDING">WEDDING</option>
        <option value="GRADUATION">GRADUATION</option>
        <option value="PARTY">PARTY</option>
        <option value="CONFERENCE">CONFERENCE</option>
        <option value="EXHIBITION">EXHIBITION</option>
        <option value="CUSTOM">CUSTOM</option>
      </select>
      <button onClick$={() => (store.modalOpen = true)}>Open Guestlist</button>
      <QwikModal
        client:load
        // @ts-ignore: Type is not assignable to type
        isOpen={store.modalOpen}
        ariaHideApp={false}
      >
        <button onClick$={() => (store.modalOpen = false)}>
          Close Guestlist
        </button>
        <GuestList
          userEmail={store.userEmail}
          openedFromEvent={true}
          eventId={params.eventId}
        />
      </QwikModal>
      <input
        preventdefault:click
        type="button"
        value="Save"
        onClick$={() => {
          if (store.event) {
            console.log(store.event.startDate);
            console.log(store.event.endDate);
            client.updateEvent.mutate({
              id: params.eventId,
              userEmail: store.event.email,
              budget: +store.event.budget,
              startDate: store.event.startDate,
              endDate: store.event.endDate,
              headcount: store.event.headcount,
              locationId: store.event.locationId,
              name: store.event.name,
              type: store.event.type,
            });
            window.location.reload();
          }
        }}
      />
      <input
        preventdefault:click
        type="button"
        value="Delete"
        onClick$={() => {
          const result = window.prompt(
            "Do you really want to delete this event? (To do so, type yes)"
          );
          if (result?.toLowerCase() === "yes") {
            client.deleteEvent.mutate({
              id: params.eventId,
            });
            navigate.path = paths.events;
          }
        }}
      />
      <button
        preventdefault:click
        onClick$={async () => {
          exportToCalendar(store);
        }}
      >
        Export to Calendar
      </button>
      <button
        preventdefault:click
        onClick$={() => {
          navigate.path = paths.location + store.event?.locationId;
        }}
      >
        Go to Location
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
      .filter((event) => event.startDate >= new Date())
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
    url: store.location?.link.startsWith("http")
      ? store.location?.link
      : "http://" + store.location?.link,
    // geo: { lat: 40.0095, lon: 105.2669 },
    status: "CONFIRMED",
    busyStatus: "BUSY",
    organizer: {
      name: user.user!.lastname + " " + user.user!.firstname,
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
