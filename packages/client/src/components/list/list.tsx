import {
  component$,
  Resource,
  useBrowserVisibleTask$,
  useResource$,
  useSignal,
} from "@builder.io/qwik";
import type { ResourceReturn, Signal } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import type {
  GetEventsReturnType,
  GetLocationsReturnType,
  ListProps,
} from "~/utils/types";
import { paths } from "~/utils/paths";
import { getUser } from "~/utils/supabase.client";
import { client } from "~/utils/trpc";
import Card from "../card/card";

export const List = component$((props: ListProps) => {
  const email = useSignal<string>("");
  const searchInput = useSignal<string>("");
  const navigate = useNavigate();

  useBrowserVisibleTask$(async ({ track }) => {
    track(() => email.value);
    const userResponse = await getUser();
    if (!userResponse.data.user) {
      navigate(paths.login);
    }
    if (userResponse.data.user?.email) {
      email.value = userResponse.data.user.email;
    }
  });

  const eventResource = useResource$<GetEventsReturnType>(
    // @ts-ignore
    ({ track, cleanup }) => {
      track(() => email.value);
      const controller = new AbortController();
      cleanup(() => controller.abort());
      return client.getEvents.query({
        email: email.value,
      });
    }
  );

  const locationResource = useResource$<GetLocationsReturnType>(
    ({ track, cleanup }) => {
      track(() => email.value);
      const controller = new AbortController();
      cleanup(() => controller.abort());
      return client.getLocations.query({
        email: email.value,
      });
    }
  );
  return (
    <div>
      <div class="m-auto w-1/2 p-2.5">
        <input
          preventdefault:change
          onInput$={(event) => {
            searchInput.value = (
              event.target as HTMLInputElement
            ).value.toLowerCase();
          }}
          type="search"
          class="block w-full self-center p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Search.."
        />
      </div>
      {generateList(props, eventResource, searchInput, locationResource)}
    </div>
  );
});

export const generateList = (
  props: ListProps,
  eventResource: ResourceReturn<GetEventsReturnType>,
  searchInput: Signal<string>,
  locationResource: ResourceReturn<GetLocationsReturnType>
) => {
  return (
    <div>
      {props.isEvent ? (
        <Resource
          value={eventResource}
          onPending={() => <div>Loading...</div>}
          onResolved={(result: GetEventsReturnType) => {
            return (
              <div>
                {result.events.length > 0 ? (
                  result.events
                    .filter((event) =>
                      props.isActive
                        ? event.endDate && event?.endDate >= new Date()
                        : event.endDate && event?.endDate < new Date()
                    )
                    .filter((event) => {
                      if (searchInput.value.length > 0) {
                        return event.name
                          .toLowerCase()
                          .includes(searchInput.value);
                      } else {
                        return event;
                      }
                    })
                    .map((event) => {
                      return (
                        <Card
                          id={event.id}
                          description={event.type ?? ""}
                          name={event.name}
                          type={props.isActive ? "event" : "previous"}
                          goTo={
                            props.isActive
                              ? paths.event + event.id
                              : paths.previousEvent + event.id
                          }
                          icon="event"
                          location={event.location.name}
                        />
                      );
                    })
                ) : (
                  <h1 class="mt-6 mb-6 text-3xl font-bold text-black dark:text-white text-center">
                    You have no {props.isActive ? "active" : "previous"} events
                    yet! &#128561;
                  </h1>
                )}
              </div>
            );
          }}
        />
      ) : (
        <Resource
          value={locationResource}
          onPending={() => <div>Loading...</div>}
          onResolved={(result) => {
            return (
              <div>
                {result.locations.length > 0 ? (
                  result.locations
                    .filter((event) => {
                      if (searchInput.value.length > 0) {
                        return event.name
                          .toLowerCase()
                          .includes(searchInput.value);
                      } else {
                        return event;
                      }
                    })
                    .map((location) => {
                      return (
                        <Card
                          id={location.id}
                          description={location.price?.toString() + " Ft"}
                          name={location.name}
                          type="location"
                          goTo={paths.location + location.id}
                          icon="location"
                        />
                      );
                    })
                ) : (
                  <h1 class="mt-6 mb-6 text-3xl font-bold text-black dark:text-white text-center">
                    You have no locations yet. &#128564;
                  </h1>
                )}
              </div>
            );
          }}
        />
      )}
    </div>
  );
};
