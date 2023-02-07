import {
  component$,
  Resource,
  useResource$,
  useSignal,
  useClientEffect$,
  useStyles$,
} from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import Card from "~/components/card/card";
import type { GetEventsReturnType } from "~/types";
import { paths } from "~/utils/paths";
import { getUser } from "~/utils/supabase.client";
import { client } from "~/utils/trpc";
import styles from "./index.css?inline";

export default component$(() => {
  useStyles$(styles);
  const email = useSignal("");
  const navigate = useNavigate();

  useClientEffect$(async ({ track }) => {
    track(() => email.value);
    const userResponse = await getUser();
    if (!userResponse.data.user) {
      navigate.path = paths.login;
    }
    if (userResponse.data.user?.email) {
      email.value = userResponse.data.user.email;
    }
  });

  const resource = useResource$<GetEventsReturnType>(({ track, cleanup }) => {
    track(() => email.value);
    const controller = new AbortController();
    cleanup(() => controller.abort());
    return client.getEvents.query({
      email: email.value,
    });
  });

  return (
    <div>
      <Resource
        value={resource}
        onPending={() => <div>Loading...</div>}
        onResolved={(result: GetEventsReturnType) => {
          return (
            <div>
              {result.events.map((event) => {
                return (
                  <Card
                    id={event.id}
                    description={event.type}
                    name={event.name}
                    color="card-2"
                    goTo={paths.event + event.id}
                    icon="event"
                    location={event.location.name}
                  />
                );
              })}
            </div>
          );
        }}
      />
    </div>
  );
});
