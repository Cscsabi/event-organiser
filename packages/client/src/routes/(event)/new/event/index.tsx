import {
  component$,
  Resource,
  useClientEffect$,
  useResource$,
  useStore,
  useStyles$,
} from "@builder.io/qwik";
import type { NewEventStore, GetLocationsReturnType } from "~/utils/types";
import { EventType } from "@prisma/client";
import { client } from "~/utils/trpc";
import { getUser } from "~/utils/supabase.client";
import { useNavigate } from "@builder.io/qwik-city";
import { paths } from "~/utils/paths";
import styles from "~/routes/index.scss?inline";
import { Status } from "event-organiser-api-server/src/status.enum";
import {
  getMaxTimeFormat,
  getMinTimeFormat,
  getProperDateFormat,
  getProperTimeFormat,
} from "~/utils/common.functions";

export default component$(() => {
  useStyles$(styles);
  const navigate = useNavigate();
  const store = useStore<NewEventStore>({
    name: "",
    type: EventType.CUSTOM,
    startDate: new Date(),
    endDate: new Date(),
    budget: 0,
    locationId: "",
    email: "",
    headcount: 0,
    decorNeeded: false,
    menuNeeded: false,
    performerNeeded: false,
  });

  const resource = useResource$<GetLocationsReturnType>(
    ({ track, cleanup }) => {
      track(() => store.email);
      const controller = new AbortController();
      cleanup(() => controller.abort());
      return client.getLocations.query({ email: store.email });
    }
  );

  useClientEffect$(async () => {
    const userDetails = await getUser();
    if (!userDetails.data.user) {
      navigate.path = paths.login;
    } else {
      store.email = userDetails.data.user.email ?? "";
    }
  });

  return (
    <div class="form_wrapper">
      <div class="form_container">
        <div class="title_container">
          <h2>Create New Event</h2>
        </div>
        <div class="row clearfix">
          <div class="">
            <form
              preventdefault:submit
              onSubmit$={async () => {
                const result = await client.addEvent.mutate({
                  budget: store.budget,
                  startDate: new Date(store.startDate),
                  endDate: new Date(store.endDate),
                  headcount: store.headcount,
                  name: store.name,
                  type: store.type,
                  userEmail: store.email,
                  locationId: store.locationId,
                  decorNeeded: store.decorNeeded,
                  menuNeeded: store.menuNeeded,
                  performerNeeded: store.performerNeeded,
                });

                if (result.status === Status.SUCCESS) {
                  navigate.path = paths.event + result.event.id;
                }
              }}
            >
              <label for="eventName">Event name:</label>
              <div class="input_field">
                <input
                  onInput$={(event) =>
                    (store.name = (event.target as HTMLInputElement).value)
                  }
                  type="text"
                  name="eventName"
                ></input>
              </div>
              <label for="eventType">Event type:</label>
              <div class="input_field">
                <select
                  id="eventType"
                  name="eventType"
                  onClick$={(event) =>
                    (store.type = (event.target as HTMLInputElement)
                      .value as EventType)
                  }
                >
                  <option value="" selected disabled hidden>
                    Choose here
                  </option>
                  <option value="WEDDING">WEDDING</option>
                  <option value="GRADUATION">GRADUATION</option>
                  <option value="PARTY">PARTY</option>
                  <option value="CONFERENCE">CONFERENCE</option>
                  <option value="EXHIBITION">EXHIBITION</option>
                  <option value="CUSTOM">CUSTOM</option>
                </select>
              </div>
              <label for="menu">Menu:</label>
              <div class="input_field">
                <input
                  onInput$={(event) =>
                    (store.menuNeeded = (
                      event.target as HTMLInputElement
                    ).checked)
                  }
                  type="checkbox"
                  name="menu"
                ></input>
              </div>
              <label for="decor">Decor:</label>
              <div class="input_field">
                <input
                  onInput$={(event) =>
                    (store.decorNeeded = (
                      event.target as HTMLInputElement
                    ).checked)
                  }
                  type="checkbox"
                  name="decor"
                ></input>
              </div>
              <label for="perfomer">Performer:</label>
              <div class="input_field">
                <input
                  onInput$={(event) =>
                    (store.performerNeeded = (
                      event.target as HTMLInputElement
                    ).checked)
                  }
                  type="checkbox"
                  name="perfomer"
                ></input>
              </div>
              <label for="startDate">Start Date:</label>
              <div class="input_field">
                <input
                  onChange$={(event) => {
                    const inputs = (
                      event.target as HTMLInputElement
                    ).value.split("-");
                    store.startDate = new Date(
                      +inputs[0],
                      +inputs[1] - 1, // Starts from zero
                      +inputs[2],
                      store.startDate.getHours(),
                      store.startDate.getMinutes()
                    );
                    console.log("start", store.startDate);
                  }}
                  type="date"
                  name="startDate"
                  min={getProperDateFormat()}
                  // max={getProperDateFormat(store.endDate)}
                ></input>
              </div>
              <label for="startTime">Start Time:</label>
              <div class="input_field">
                <input
                  onChange$={(event) => {
                    const inputs = (
                      event.target as HTMLInputElement
                    ).value.split(":");
                    store.startDate = new Date(
                      store.startDate.getFullYear(),
                      store.startDate.getMonth(),
                      store.startDate.getDate(),
                      +inputs[0],
                      +inputs[1] - store.endDate.getTimezoneOffset()
                    );
                  }}
                  type="time"
                  name="startTime"
                  max={getMaxTimeFormat(store.startDate, store.endDate)}
                ></input>
              </div>
              <label for="endDate">End Date:</label>
              <div class="input_field">
                <input
                  onChange$={(event) => {
                    const inputs = (
                      event.target as HTMLInputElement
                    ).value.split("-");
                    store.endDate = new Date(
                      +inputs[0],
                      +inputs[1] - 1, // Starts from zero
                      +inputs[2],
                      store.endDate.getHours(),
                      store.endDate.getMinutes()
                    );
                  }}
                  type="date"
                  name="endDate"
                  min={getProperDateFormat(store.startDate)}
                ></input>
              </div>
              <label for="endTime">End Time:</label>
              <div class="input_field">
                <input
                  onChange$={(event) => {
                    console.log(getProperTimeFormat(store.endDate));
                    console.log(store.endDate.getTimezoneOffset());
                    const inputs = (
                      event.target as HTMLInputElement
                    ).value.split(":");
                    store.endDate = new Date(
                      store.endDate.getFullYear(),
                      store.endDate.getMonth(),
                      store.endDate.getDate(),
                      +inputs[0],
                      +inputs[1] - store.endDate.getTimezoneOffset()
                    );
                  }}
                  type="time"
                  name="endTime"
                  min={getMinTimeFormat(store.startDate, store.endDate)}
                ></input>
              </div>
              <label for="budget">Event budget:</label>
              <div class="input_field">
                <input
                  onInput$={(event) =>
                    (store.budget = +(event.target as HTMLInputElement).value)
                  }
                  type="number"
                  name="budget"
                ></input>
              </div>
              <label for="headcount">Headcount:</label>
              <div class="input_field">
                <input
                  onInput$={(event) =>
                    (store.headcount = +(event.target as HTMLInputElement)
                      .value)
                  }
                  type="number"
                  name="headcount"
                ></input>
              </div>
              <label for="location">Location:</label>
              <Resource
                value={resource}
                onPending={() => <div>Loading...</div>}
                onResolved={(result: GetLocationsReturnType) => {
                  return (
                    <div class="input_field">
                      <select
                        name="location"
                        onChange$={(event) => {
                          console.log(event.target);
                          store.locationId = (
                            event.target as unknown as HTMLInputElement
                          ).value;
                        }}
                      >
                        <option value="" selected disabled hidden>
                          Choose here
                        </option>
                        {result.locations.map((location) => {
                          return (
                            <option value={location.id}>{location.name}</option>
                          );
                        })}
                        ;
                      </select>
                    </div>
                  );
                }}
              />
              <input type="submit" value="Create Event"></input>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
});
