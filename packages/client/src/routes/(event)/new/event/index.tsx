import {
  component$,
  Resource,
  useClientEffect$,
  useResource$,
  useStore,
  useStyles$,
} from "@builder.io/qwik";
import type { EventInterface, GetLocationsReturnType } from "~/types";
import { EventType } from "@prisma/client";
import { client } from "~/utils/trpc";
import { getUser } from "~/utils/supabase.client";
import { useNavigate } from "@builder.io/qwik-city";
import { paths } from "~/utils/paths";
import styles from "~/routes/index.scss?inline";

export default component$(() => {
  useStyles$(styles);
  const navigate = useNavigate();
  const store = useStore<EventInterface>({
    name: "",
    type: EventType.CUSTOM,
    date: new Date(),
    budget: 0,
    locationId: "",
    email: "",
    headcount: 0,
  });

  const resource = useResource$<GetLocationsReturnType>(
    ({ track, cleanup }) => {
      track(() => store.email);
      const controller = new AbortController();
      cleanup(() => controller.abort());
      const result = client.getLocations.query({ email: store.email });
      return result;
    }
  );

  useClientEffect$(() => {
    getUser().then((user) => {
      if (!user.data.user) {
        navigate.path = paths.login;
      } else {
        store.email = user.data.user?.email || "";
      }
    });
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
              onSubmit$={() => {
                const status = client.addEvent.mutate({
                  budget: store.budget,
                  date: new Date(store.date),
                  headcount: store.headcount,
                  name: store.name,
                  type: store.type,
                  userEmail: store.email,
                  locationId: store.locationId,
                });

                status.then((result) => {
                  if (result.status === "success") {
                    navigate.path = paths.event + result.event.id;
                  }
                });
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
                  <option value="WEDDING">Wedding</option>
                  <option value="GRADUATION">Graduation</option>
                  <option value="ONLINE">Online</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>
              <label for="date">Date:</label>
              <div class="input_field">
                <input
                  onInput$={(event) =>
                    (store.date = new Date(
                      (event.target as HTMLInputElement).value
                    ))
                  }
                  type="date"
                  name="email"
                ></input>
              </div>
              <label for="budget">Event budget:</label>
              <div class="input_field">
                <input
                  onInput$={(event) =>
                    (store.budget = +(event.target as HTMLInputElement).value)
                  }
                  type="number"
                  name="email"
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
                  name="email"
                ></input>
              </div>
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
