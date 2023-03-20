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
  EventTypeTranslation,
  GetEventsReturnType,
  GetLocationsReturnType,
  ListProps,
} from "~/utils/types";
import Card from "../card/card";

export const List = component$((props: ListProps) => {
  const user = useContext(CTX);
  const searchInput = useSignal<string>("");
  const loading = useSignal(t("common.loading@@Loading..."));
  // TODO: Undefined lang
  const eventType = useStore<EventTypeTranslation>({
    wedding: t("event.wedding@@Wedding"),
    graduation: t("event.graduation@@Graduation"),
    party: t("event.party@@Party"),
    conference: t("event.conference@@Conference"),
    exhibition: t("event.exhibition@@Exhibition"),
    custom: t("event.custom@@Custom"),
  });

  const eventResource = useResource$<GetEventsReturnType>(
    // @ts-ignore
    ({ track, cleanup }) => {
      track(() => user.userEmail);
      const controller = new AbortController();
      cleanup(() => controller.abort());
      return client.getEvents.query({
        email: user.userEmail,
      });
    }
  );

  const locationResource = useResource$<GetLocationsReturnType>(
    ({ track, cleanup }) => {
      track(() => user.userEmail);
      const controller = new AbortController();
      cleanup(() => controller.abort());
      return client.getLocations.query({
        email: user.userEmail,
      });
    }
  );

  return (
    <Speak assets={["list", "common", "event"]}>
      <div class="w-full m-auto mb-20">
        <div class="inline-block float-left ml-12">
          <a
            href={!props.isEvent ? paths.newLocation : paths.newEvent}
            class={`${
              !props.isActive && props.isActive !== undefined ? "hidden" : ""
            } w-[10rem]`}
          >
            <button class="min-w-[10rem] min-h-[3rem] mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600">
              {props.isEvent ? (
                <div>
                  <i class="fa-solid fa-calendar-plus"></i>{" "}
                  {t("list.addEvent@@Add Event")}
                </div>
              ) : (
                <div>
                  <i class="fa-solid fa-map-pin"></i>{" "}
                  {t("list.addLocation@@Add Location")}
                </div>
              )}
            </button>
          </a>
        </div>
        <div class="flex justify-center items-center">
          <input
            preventdefault:change
            onInput$={(event) => {
              searchInput.value = (
                event.target as HTMLInputElement
              ).value.toLowerCase();
            }}
            type="search"
            class="w-3/5 min-w-[40rem] p-4 pl-10 mb-6 rounded-xl bg-gray-300 border border-gray-300 text-gray-900 text-md focus:ring-green-600 focus:border-green-600 block p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
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
        eventType
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
  eventType: EventTypeTranslation
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
                            ? eventType.wedding
                            : event.type === "GRADUATION"
                            ? t("event.graduation@@Graduation")
                            : event.type === "PARTY"
                            ? t("event.party@@Party")
                            : event.type === "CONFERENCE"
                            ? t("event.conference@@Conference")
                            : event.type === "EXHIBITION"
                            ? t("event.exhibition@@Exhibition")
                            : event.type === "CUSTOM"
                            ? t("event.custom@@Custom")
                            : ""
                        }
                        name={event.name}
                        type={props.isActive ? "event" : "previous"}
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
                        description={location.price?.toString() + " Ft"}
                        name={location.name}
                        type="location"
                        goTo={paths.location + location.id}
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
