import {
  component$,
  Resource,
  useBrowserVisibleTask$,
  useResource$,
  useSignal,
  useStyles$,
} from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import type { StaticGenerateHandler } from "@builder.io/qwik-city";
import { client } from "~/utils/trpc";
import type { NewEventStore, GetGuestReturnType } from "~/utils/types";
import { getUser } from "~/utils/supabase.client";
import { paths } from "~/utils/paths";
import styles from "~/table.css?inline";
import {
  getProperDateFormat,
  getProperTimeFormat,
} from "~/utils/common.functions";
import { BudgetPlanning } from "~/components/budget-planning/budget.planning";

export default component$(() => {
  useStyles$(styles);

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
      <h1>Previous events cannot be modified!</h1>
      <label for="budget">Budget:</label>
      <input type="number" readOnly value={newEventStore.value?.budget}></input>
      <label for="startDate">Start Date:</label>
      <input
        readOnly
        type="date"
        value={getProperDateFormat(newEventStore.value?.startDate)}
      ></input>
      <label for="startTime">Start Time:</label>
      <input
        readOnly
        type="time"
        value={getProperTimeFormat(newEventStore.value?.startDate)}
      ></input>
      <label for="endDate">End Date:</label>
      <input
        readOnly
        type="date"
        value={getProperDateFormat(newEventStore.value?.endDate)}
      ></input>
      <label for="endTime">End Time:</label>
      <input
        readOnly
        type="time"
        value={getProperTimeFormat(newEventStore.value?.endDate)}
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
      <Resource
        value={resource}
        onPending={() => <div>Loading...</div>}
        onResolved={(result: GetGuestReturnType) => {
          return (
            <div>
              {result.guests.length === 0 ? (
                ""
              ) : (
                <div class="table-wrapper">
                  Guestlist:
                  <table class="fl-table">
                    <thead>
                      <tr>
                        <th>Firstname</th>
                        <th>Lastname</th>
                        <th>Email</th>
                        <th>Special Needs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.guests.map((guest) => {
                        return (
                          <tr>
                            <td>{guest.firstname}</td>
                            <td>{guest.lastname}</td>
                            <td>{guest.email}</td>
                            <td>{guest.description}</td>
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
      <BudgetPlanning
        active={false}
        budget={newEventStore.value?.budget ?? 0}
        eventId={params.eventId}
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
            navigate(paths.events);
          }
        }}
      />
      <button
        preventdefault:click
        onClick$={() => {
          navigate(paths.location + newEventStore.value?.locationId);
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
