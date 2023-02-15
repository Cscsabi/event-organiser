import { component$, useClientEffect$, useSignal } from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import type { StaticGenerateHandler } from "@builder.io/qwik-city";
import { client } from "~/utils/trpc";
import type { EventInterface } from "~/types";
import { getUser } from "~/utils/supabase.client";
import { paths } from "~/utils/paths";

export default component$(() => {
  const { params } = useLocation();
  const newEventStore = useSignal<EventInterface>();
  const navigate = useNavigate();

  useClientEffect$(async () => {
    const userDetails = await getUser();
    if (!userDetails.data.user) {
      navigate.path = paths.login;
    }

    const event = await getCurrentEvent(params.eventId);
    if (event) {
      if (event.date >= new Date()) {
        navigate.path = paths.event + params.eventId;
      }

      const currentLocation: EventInterface = {
        budget: +event.budget,
        date: event.date,
        email: event.email,
        headcount: event.headcount,
        locationId: event.locationId,
        name: event.name,
        type: event.type,
      };
      console.log(params);

      newEventStore.value = currentLocation;
      console.log(
        newEventStore.value?.date
          .toLocaleDateString()
          .replace(/\. /g, "-")
          .replace(".", "")
      );
    }
  });

  return (
    <div>
      <h1>Previous events cannot be modified!</h1>
      <label for="budget">Budget:</label>
      <input type="number" readOnly value={newEventStore.value?.budget}></input>
      <label for="date">Date:</label>
      <input
        readOnly
        type="datetime-local"
        value={newEventStore.value?.date.toISOString().replace(":00.000Z", "")}
      ></input>
      <label for="headcount">Headcount:</label>
      <input
        readOnly
        type="number"
        value={newEventStore.value?.headcount}
      ></input>
      <label for="name">Event Name:</label>
      <input readOnly type="text" value={newEventStore.value?.name}></input>
      <label for="type">Event Type:</label>
      <input readOnly type="text" value={newEventStore.value?.type}></input>
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
    params: result.events.filter((event) => event.date < new Date()).map((event) => {
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
