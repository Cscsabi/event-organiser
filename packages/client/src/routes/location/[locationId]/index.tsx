import { component$, useClientEffect$, useSignal } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import type { StaticGenerateHandler } from "@builder.io/qwik-city";
import { client } from "~/utils/trpc";
import type { LocationInterface } from "~/types";
import { getUser } from "~/utils/supabase.client";

export default component$(() => {
  const { params } = useLocation();
  const locationStore = useSignal<LocationInterface>();

  useClientEffect$(() => {
    getCurrentLocation(params.locationId).then((location) => {
      if (location) {
        const currentLocation: LocationInterface = {
          addressId: location.addressId,
          city: location.address.city,
          countryId: location.address.countryId,
          description: location.description,
          email: location.email,
          link: location.link,
          name: location.name,
          phone: location.phone,
          price: +location.price,
          state: location.address.state,
          street: location.address.street,
          type: location.type,
          zipCode: +location.address.zip_code,
        };
        locationStore.value = currentLocation;
      }
    });
  });

  return (
    <div>
      <p>{params.locationId}</p>
      <p>{locationStore.value?.city}</p>
      <p>{locationStore.value?.description}</p>
      <p>{locationStore.value?.email}</p>
      <p>{locationStore.value?.link}</p>
      <p>{locationStore.value?.name}</p>
      <p>{locationStore.value?.phone}</p>
      <p>{locationStore.value?.price}</p>
      <p>{locationStore.value?.state}</p>
      <p>{locationStore.value?.street}</p>
      <p>{locationStore.value?.zipCode}</p>
      <p>{locationStore.value?.type}</p>
    </div>
  );
});

export const onStaticGenerate: StaticGenerateHandler = async () => {
  const userResponse = await getUser();

  const result = await client.getLocations.query({
    email: userResponse.data.user?.email || "",
  });

  return {
    params: result.locations.map((locations) => {
      const id = locations.id;
      return {
        id,
      };
    }),
  };
};

export async function getCurrentLocation(locationId: string) {
  const result = await client.getLocation.query({ id: locationId });
  return result.location;
}
