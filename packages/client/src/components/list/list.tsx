import {
  component$,
  Resource,
  useContext,
  useResource$,
  useSignal,
  useStore,
  type ResourceReturn,
  type Signal,
} from "@builder.io/qwik";
import { $translate as t, Speak } from "qwik-speak";
import { CTX } from "~/routes/[...lang]/layout";
import { paths } from "~/utils/paths";
import { client } from "~/utils/trpc";
import type {
  GetEventsReturnType,
  GetLocationsReturnType,
  ListProps,
  TypeTranslations,
} from "~/utils/types";
import Card from "../card/card";

export const List = component$((props: ListProps) => {
  const user = useContext(CTX);
  const searchInput = useSignal<string>("");
  const loading = useSignal(t("common.loading@@Loading..."));
  const typeTranslations = useStore<TypeTranslations>({
    wedding: t("event.wedding@@Wedding"),
    graduation: t("event.graduation@@Graduation"),
    party: t("event.party@@Party"),
    conference: t("event.conference@@Conference"),
    exhibition: t("event.exhibition@@Exhibition"),
    custom: t("event.custom@@Custom"),
    interior: t("location.interior@@Interior"),
    exterior: t("location.exterior@@Exterior"),
    both: t("location.both@@Interior and Exterior"),
  });

  const eventResource = useResource$<GetEventsReturnType>(
    // @ts-ignore
    ({ track, cleanup }) => {
      track(() => user.userEmail);
      const controller = new AbortController();
      cleanup(() => controller.abort());
      return client.getEvents.query({
        email: user.userEmail ?? "",
      });
    }
  );

  const locationResource = useResource$<GetLocationsReturnType>(
    ({ track, cleanup }) => {
      track(() => user.userEmail);
      const controller = new AbortController();
      cleanup(() => controller.abort());
      return client.getLocations.query({
        email: user.userEmail ?? "",
      });
    }
  );

  return (
    <Speak assets={["list", "common", "event", "location"]}>
      <div class="w-full m-auto mb-20">
        <div class="flex justify-center items-center">
          <input
            preventdefault:change
            onInput$={(event) => {
              searchInput.value = (
                event.target as HTMLInputElement
              ).value.toLowerCase();
            }}
            type="search"
            class="w-3/5 min-w-[40rem] p-4 pl-10 mb-6 rounded-xl border bg-gray-300 border-slate-400 text-gray-900 text-md rounded-lg p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder={t("common.search@@Search..")}
          />
        </div>
      </div>
      {generateList(
        props,
        eventResource,
        searchInput,
        locationResource,
        loading,
        typeTranslations
      )}
    </Speak>
  );
});

export const generateList = (
  props: ListProps,
  eventResource: ResourceReturn<GetEventsReturnType>,
  searchInput: Signal<string>,
  locationResource: ResourceReturn<GetLocationsReturnType>,
  loading: Signal<string>,
  typeTranslations: TypeTranslations
) => {
  return (
    <div>
      {props.isEvent ? (
        <Resource
          value={eventResource}
          onPending={() => <div>{loading.value}</div>}
          onResolved={(result: GetEventsReturnType) => {
            return (
              <div class="flex flex-wrap justify-center">
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
                        description={
                          event.type === "WEDDING"
                            ? typeTranslations.wedding
                            : event.type === "GRADUATION"
                            ? typeTranslations.graduation
                            : event.type === "PARTY"
                            ? typeTranslations.party
                            : event.type === "CONFERENCE"
                            ? typeTranslations.conference
                            : event.type === "EXHIBITION"
                            ? typeTranslations.exhibition
                            : event.type === "CUSTOM"
                            ? typeTranslations.custom
                            : ""
                        }
                        name={event.name}
                        goTo={
                          props.isActive
                            ? paths.event + event.id
                            : paths.previousEvent + event.id
                        }
                        icon="event"
                        location={event.location.name}
                        key={event.id}
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
          onPending={() => <div>{loading.value}</div>}
          onResolved={(result) => {
            return (
              <div class="flex flex-wrap justify-center" key={""}>
                {result.locations
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
                        description={
                          location.type === "INTERIOR"
                            ? typeTranslations.interior
                            : location.type === "EXTERIOR"
                            ? typeTranslations.exterior
                            : location.type === "BOTH"
                            ? typeTranslations.both
                            : ""
                        }
                        name={location.name}
                        goTo={paths.location + location.id}
                        location={location.address.city}
                        icon="location"
                        key={location.id}
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
