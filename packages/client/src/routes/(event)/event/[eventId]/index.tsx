import {
  component$,
  useClientEffect$,
  useSignal,
  useStyles$,
} from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import type { StaticGenerateHandler } from "@builder.io/qwik-city";
import { client } from "~/utils/trpc";
import type { EventInterface } from "~/types";
import { getUser } from "~/utils/supabase.client";
import { paths } from "~/utils/paths";
import type { EventType } from "@prisma/client";
import { QwikModal } from "~/integrations/react/modal";
import styles from "~/table.css?inline";
import { GuestList } from "~/components/guestlist/guestlist";

export default component$(() => {
  useStyles$(styles);
  const { params } = useLocation();
  const newEventStore = useSignal<EventInterface>();
  const navigate = useNavigate();
  const modalOpen = useSignal<boolean>(false);
  const userEmail = useSignal<string>("");

  useClientEffect$(async ({ track }) => {
    track(() => userEmail.value);
    const userDetails = await getUser();
    if (!userDetails.data.user) {
      navigate.path = paths.login;
    }

    userEmail.value = userDetails.data.user?.email ?? "";

    const event = await getCurrentEvent(params.eventId);
    if (event) {
      if (event.date < new Date()) {
        navigate.path = paths.previousEvent + params.eventId;
      }

      const currentEvent: EventInterface = {
        budget: +event.budget,
        date: event.date,
        email: event.email,
        headcount: event.headcount,
        locationId: event.locationId,
        name: event.name,
        type: event.type,
      };
      newEventStore.value = currentEvent;
      console.log(params);
      console.log(
        newEventStore.value?.date.toISOString().replace(":00.000Z", "")
      );
    }
  });

  return (
    <div>
      <label for="budget">Budget:</label>
      <input
        type="number"
        onChange$={(event) =>
          (newEventStore.value!.budget = +(event.target as HTMLInputElement)
            .value)
        }
        value={newEventStore.value?.budget}
      ></input>
      <label for="date">Date:</label>
      <input type="hidden" id="timezone" name="timezone" value="-08:00" />
      <input
        type="datetime-local"
        pattern="\d{4}-\d{2}-\d{2}T\d{2}\d{2}"
        onChange$={(event) => {
          console.log((event.target as HTMLInputElement).value);
          newEventStore.value!.date = new Date(
            (event.target as HTMLInputElement).value
          );
          console.log(newEventStore.value!.date);
        }}
        value={newEventStore.value?.date.toISOString().replace(":00.000Z", "")}
      ></input>
      <input
        type="number"
        onChange$={(event) =>
          (newEventStore.value!.headcount = +(event.target as HTMLInputElement)
            .value)
        }
        value={newEventStore.value?.headcount}
      ></input>
      <input
        type="text"
        onChange$={(event) =>
          (newEventStore.value!.name = (event.target as HTMLInputElement).value)
        }
        value={newEventStore.value?.name}
      ></input>
      <select
        id="eventType"
        name="eventType"
        onClick$={(event) =>
          (newEventStore.value!.type = (event.target as HTMLInputElement)
            .value as EventType)
        }
      >
        <option value="" selected disabled hidden>
          {newEventStore.value!.type}
        </option>
        <option value="WEDDING">WEDDING</option>
        <option value="GRADUATION">GRADUATION</option>
        <option value="PARTY">PARTY</option>
        <option value="CONFERENCE">CONFERENCE</option>
        <option value="EXHIBITION">EXHIBITION</option>
        <option value="CUSTOM">CUSTOM</option>
      </select>
      <button onClick$={() => (modalOpen.value = true)}>Guestlist</button>
      <QwikModal
        client:load
        // @ts-ignore: Type is not assignable to type
        isOpen={modalOpen.value}
        ariaHideApp={false}
      >
        <button onClick$={() => (modalOpen.value = false)}>
          Close Guestlist
        </button>
        <GuestList
          userEmail={userEmail.value}
          openedFromEvent={true}
          eventId={params.eventId}
        />
      </QwikModal>
      <input
        preventdefault:click
        type="button"
        value="save"
        onClick$={() => {
          if (newEventStore.value) {
            client.updateEvent.mutate({
              id: params.eventId,
              userEmail: newEventStore.value.email,
              budget: +newEventStore.value.budget,
              date: newEventStore.value.date,
              headcount: newEventStore.value.headcount,
              locationId: newEventStore.value.locationId,
              name: newEventStore.value.name,
              type: newEventStore.value.type,
            });
            window.location.reload();
          }
        }}
      />
      <input
        preventdefault:click
        type="button"
        value="delete"
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
    </div>
  );
});

export const onStaticGenerate: StaticGenerateHandler = async () => {
  const result = await client.getEvents.query({
    email: (await getUser()).data.user?.email ?? "",
  });

  return {
    params: result.events
      .filter((event) => event.date >= new Date())
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
