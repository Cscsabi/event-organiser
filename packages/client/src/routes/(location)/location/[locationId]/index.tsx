import { component$, useClientEffect$, useSignal } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import type { StaticGenerateHandler } from "@builder.io/qwik-city";
import { useNavigate } from "@builder.io/qwik-city";
import { client } from "~/utils/trpc";
import type { LocationInterface } from "~/types";
import { getUser } from "~/utils/supabase.client";
import { paths } from "~/utils/paths";

export default component$(() => {
  const { params } = useLocation();
  const locationStore = useSignal<LocationInterface>();
  const navigate = useNavigate();

  useClientEffect$(async () => {
    const result = await getUser();
    if (!result.data.user) {
      navigate.path = paths.login;
    }
    const location = await getCurrentLocation(params.locationId);
    if (location) {
      locationStore.value = location;
    }
  });

  return (
    <div>
      <label for="city">City:</label>
      <input
        onChange$={(event) => {
          locationStore.value!.city = (event.target as HTMLInputElement).value;
        }}
        value={locationStore.value?.city}
      ></input>
      <label for="description">Description:</label>
      <input
        onChange$={(event) => {
          locationStore.value!.description = (
            event.target as HTMLInputElement
          ).value;
        }}
        value={locationStore.value?.description}
      ></input>
      <label for="email">Email:</label>
      <input
        onChange$={(event) => {
          locationStore.value!.email = (event.target as HTMLInputElement).value;
        }}
        value={locationStore.value?.email}
      ></input>
      <label for="link">Link:</label>
      <input
        onChange$={(event) => {
          locationStore.value!.link = (event.target as HTMLInputElement).value;
        }}
        value={locationStore.value?.link}
      ></input>
      <label for="name">Name:</label>
      <input
        onChange$={(event) => {
          locationStore.value!.name = (event.target as HTMLInputElement).value;
        }}
        value={locationStore.value?.name}
      ></input>
      <label for="phone">Phone:</label>
      <input
        onChange$={(event) => {
          locationStore.value!.phone = (event.target as HTMLInputElement).value;
        }}
        value={locationStore.value?.phone}
      ></input>
      <label for="price">Price:</label>
      <input
        onChange$={(event) => {
          locationStore.value!.price = +(event.target as HTMLInputElement)
            .value;
        }}
        value={locationStore.value?.price}
      ></input>
      <label for="state">State:</label>
      <input
        onChange$={(event) => {
          locationStore.value!.state = (event.target as HTMLInputElement).value;
        }}
        value={locationStore.value?.state}
      ></input>
      <label for="street">Street:</label>
      <input
        onChange$={(event) => {
          locationStore.value!.street = (
            event.target as HTMLInputElement
          ).value;
        }}
        value={locationStore.value?.street}
      ></input>
      <label for="zipCode">Zip Code:</label>
      <input
        onChange$={(event) => {
          locationStore.value!.zipCode = +(event.target as HTMLInputElement)
            .value;
        }}
        value={locationStore.value?.zipCode}
      ></input>
      <label for="type">Type:</label>
      <input
        onChange$={(event) => {
          locationStore.value!.type = (event.target as HTMLInputElement).value;
        }}
        value={locationStore.value?.type}
      ></input>
      <input
        preventdefault:click
        type="button"
        value="Save"
        onClick$={async () => {
          if (locationStore.value) {
            client.updateLocation.mutate({
              addressId: locationStore.value.addressId,
              address: {
                city: locationStore.value.city,
                country: {
                  id: +locationStore.value.countryId,
                },
                state: locationStore.value.state,
                street: locationStore.value.street,
                zipCode: locationStore.value.zipCode,
                countryId: locationStore.value.countryId,
              },
              description: locationStore.value.description,
              userEmail: locationStore.value.email,
              link: locationStore.value.link,
              name: locationStore.value.name,
              phone: locationStore.value.phone,
              price: +locationStore.value.price,
              type: locationStore.value.type,
              id: params.locationId,
            });
            window.location.reload();
          }
        }}
      ></input>
    </div>
  );
});

export const onStaticGenerate: StaticGenerateHandler = async () => {
  const userResponse = await getUser();

  const result = await client.getLocations.query({
    email: userResponse.data.user?.email ?? "",
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
  if (result.location) {
    return {
      addressId: result.location?.addressId,
      city: result.location.address.city,
      countryId: result.location.address.countryId,
      description: result.location.description,
      email: result.location.email,
      link: result.location.link,
      name: result.location.name,
      phone: result.location.phone,
      price: +result.location.price,
      state: result.location.address.state,
      street: result.location.address.street,
      type: result.location.type,
      zipCode: +result.location.address.zip_code,
    } as LocationInterface;
  }
}
