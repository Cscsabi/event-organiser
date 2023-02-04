import {
  component$,
  Resource,
  useResource$,
  useContext,
  useSignal,
  useClientEffect$,
} from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import Card from "~/components/card/card";
import { paths } from "~/utils/paths";
import { getUser } from "~/utils/supabase.client";
import { client } from "~/utils/trpc";
import { CTX } from "../layout";

export default component$(() => {
  const context = useContext(CTX);
  const email = useSignal(context.value);
  const navigate = useNavigate();

  useClientEffect$(async ({ track }) => {
    track(() => email.value);
    const userResponse = await getUser();
    if (userResponse.data.user?.email) {
      email.value = userResponse.data.user.email;
    }
  });

  const resource = useResource$((context) => {
    context.track(() => email.value);
    return client.getEvents.query({
      email: email.value,
    });
  });

  return (
    <div>
      <button onClick$={() => (navigate.path = paths.newEvent)}>
        <i class="fa-solid fa-calendar"></i> Add new Event
      </button>
      <Resource
        value={resource}
        onPending={() => <div>Loading...</div>}
        onResolved={(result) => {
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
