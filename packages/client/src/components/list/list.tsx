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
      <input
        preventdefault:change
        onInput$={(event) => {
          searchInput.value = (
            event.target as HTMLInputElement
          ).value.toLowerCase();
        }}
        type="text"
        placeholder="Search.."
      />
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
                {result.events
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
                        color={props.isActive ? "card-2" : "card-3"}
                        goTo={
                          props.isActive
                            ? paths.event + event.id
                            : paths.previousEvent + event.id
                        }
                        icon="event"
                        location={event.location.name}
                      />
                    );
                  })}
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
                {result.locations.map((location) => {
                  return (
                    <Card
                      id={location.id}
                      description={location.price?.toString() + " Ft"}
                      name={location.name}
                      color="card-1"
                      goTo={paths.location + location.id}
                      icon="location"
                    />
                  );
                })}
              </div>
            );
          }}
        />
      )}
    </div>
  );
};
