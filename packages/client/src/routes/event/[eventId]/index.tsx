import { component$, useClientEffect$, useSignal } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import type { StaticGenerateHandler } from "@builder.io/qwik-city";
import { client } from "~/utils/trpc";
import type { EventInterface } from "~/types";
import { getUser } from "~/utils/supabase.client";

export default component$(() => {
  const { params } = useLocation();
  const newEventStore = useSignal<EventInterface>();

  useClientEffect$(() => {
    getCurrentEvent(params.eventId).then((event) => {
      if (event) {
        const currentLocation: EventInterface = {
          budget: +event.budget,
          date: event.date,
          email: event.email,
          headcount: event.headcount,
          locationId: event.locationId,
          name: event.name,
          type: event.type,
        };
        newEventStore.value = currentLocation;
      }
    });
  });

  return (
    <div>
      <p>{params.eventId}</p>
      <p>{newEventStore.value?.budget}</p>
      <p>{newEventStore.value?.date.toString()}</p>
      <p>{newEventStore.value?.email}</p>
      <p>{newEventStore.value?.headcount}</p>
      <p>{newEventStore.value?.locationId}</p>
      <p>{newEventStore.value?.name}</p>
      <p>{newEventStore.value?.type}</p>
    </div>
  );
});

export const onStaticGenerate: StaticGenerateHandler = async () => {
  const result = await client.getEvents.query({
    email: (await getUser()).data.user?.email || "",
  });

  return {
    params: result.events.map((event) => {
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
