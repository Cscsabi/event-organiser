import {
  component$,
  Resource,
  useClientEffect$,
  useResource$,
  useSignal,
  useContext,
} from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import Card from "~/components/card/card";
import { paths } from "~/utils/paths";
import { client } from "~/utils/trpc";
import { getUser } from "~/utils/supabase.client";
import { CTX } from "../layout";

export default component$(() => {
  const navigate = useNavigate();
  const context = useContext(CTX);
  const email = useSignal(context.value);

  useClientEffect$(async ({ track }) => {
    track(() => email.value);
    const userResponse = await getUser();
    if (userResponse.data.user?.email) {
      email.value = userResponse.data.user.email;
    }
  });

  const resource = useResource$(async (context) => {
    context.track(() => email.value);
    return client.getLocations.query({ email: email.value });
  });

  return (
    <div>
      <button onClick$={() => (navigate.path = paths.newLocation)}>
        <i class="fa-solid fa-house"></i> Add new Location
      </button>
      {email.value ? (
        <Resource
          value={resource}
          onPending={() => <div>Loading...</div>}
          onResolved={(result: Object) => {
            return (
              <div>
                {result.locations.map((location) => {
                  return (
                    <Card
                      id={location.id}
                      description={location.description}
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
      ) : (
        ""
      )}
    </div>
  );
});
