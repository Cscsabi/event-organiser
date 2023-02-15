import {
  component$,
  Resource,
  useClientEffect$,
  useResource$,
  useSignal,
  useStyles$,
} from "@builder.io/qwik";
import { Link, useNavigate } from "@builder.io/qwik-city";
import Card from "~/components/card/card";
import { paths } from "~/utils/paths";
import { client } from "~/utils/trpc";
import { getUser } from "~/utils/supabase.client";
import styles from "./index.css?inline";
import type { GetLocationsReturnType } from "~/types";

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

  const resource = useResource$<GetLocationsReturnType>(
    async ({ track, cleanup }): Promise<GetLocationsReturnType> => {
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
      <Link href={paths.newLocation}>
        <i class="fa-solid fa-map-pin"></i> Add Location
      </Link>
      <Resource
        value={resource}
        onPending={() => <div>Loading...</div>}
        onResolved={(result) => {
          return (
            <div>
              {result.locations.map((location) => {
                return (
                  <Card
                    id={location.id}
                    description={location.price.toString() + " Ft"}
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
    </div>
  );
});
