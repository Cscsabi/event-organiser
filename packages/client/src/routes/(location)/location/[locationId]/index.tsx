import {
  component$,
  useBrowserVisibleTask$,
  useSignal,
} from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import type { StaticGenerateHandler } from "@builder.io/qwik-city";
import { useNavigate } from "@builder.io/qwik-city";
import { client } from "~/utils/trpc";
import type { LocationStore } from "~/utils/types";
import { getUser } from "~/utils/supabase.client";
import { paths } from "~/utils/paths";
import { Status } from "event-organiser-api-server/src/status.enum";
import Toast from "~/components/toast/toast";
import Modal from "~/components/modal/modal";
import { generateGoogleMapsLink } from "~/utils/common.functions";

export default component$(() => {
  const { params } = useLocation();
  const locationStore = useSignal<LocationStore>();
  const navigate = useNavigate();

  useBrowserVisibleTask$(async () => {
    const result = await getUser();
    if (!result.data.user) {
      navigate(paths.login);
    }
    const location = await getCurrentLocation(params.locationId);
    if (location) {
      locationStore.value = location;
    }
  });

  return (
    <div>
      <h1 class="mb-6 text-center text-3xl font-semibold text-black dark:text-white">
        Location
      </h1>
      <div class="grid gap-4 mb-6 mt-8 md:grid-cols-2 w-full">
        <div>
          <div>
            <label
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
              for="name"
            >
              Name:
            </label>
            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
              onChange$={(event) => {
                locationStore.value!.name = (
                  event.target as HTMLInputElement
                ).value;
              }}
              value={locationStore.value?.name}
            ></input>
          </div>
          <div>
            <label
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
              for="description"
            >
              Description:
            </label>
            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
              onChange$={(event) => {
                locationStore.value!.description = (
                  event.target as HTMLInputElement
                ).value;
              }}
              value={locationStore.value?.description}
            ></input>
          </div>
          <div class="grid gap-6 md:grid-cols-2 w-full">
            <div>
              <label
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="type"
              >
                Type:
              </label>
              <input
                class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
                onChange$={(event) => {
                  locationStore.value!.type = (
                    event.target as HTMLInputElement
                  ).value;
                }}
                value={locationStore.value?.type}
              ></input>
            </div>
            <div>
              <label
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="link"
              >
                Link:
              </label>
              <input
                class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
                onChange$={(event) => {
                  locationStore.value!.link = (
                    event.target as HTMLInputElement
                  ).value;
                }}
                value={locationStore.value?.link}
              ></input>
            </div>
          </div>
          <div class="grid gap-6 mb-6 md:grid-cols-2 w-full">
            <div>
              <label
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="phone"
              >
                Phone:
              </label>
              <input
                class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
                onChange$={(event) => {
                  locationStore.value!.phone = (
                    event.target as HTMLInputElement
                  ).value;
                }}
                value={locationStore.value?.phone}
              ></input>
            </div>
            <div>
              <label
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="price"
              >
                Price:
              </label>
              <input
                type="number"
                class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
                onChange$={(event) => {
                  locationStore.value!.price = +(
                    event.target as HTMLInputElement
                  ).value;
                }}
                value={locationStore.value?.price}
              ></input>
            </div>
          </div>
          <div>
            <label
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
              for="state"
            >
              State:
            </label>
            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
              onChange$={(event) => {
                locationStore.value!.state = (
                  event.target as HTMLInputElement
                ).value;
              }}
              value={locationStore.value?.state}
            ></input>
          </div>
          <div class="grid gap-6 mb-6 md:grid-cols-2 w-full">
            <div>
              <label
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="city"
              >
                City:
              </label>
              <input
                class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
                onChange$={(event) => {
                  locationStore.value!.city = (
                    event.target as HTMLInputElement
                  ).value;
                }}
                value={locationStore.value?.city}
              ></input>
            </div>
            <div>
              <label
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="zipCode"
              >
                Zip Code:
              </label>
              <input
                type="number"
                class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
                onChange$={(event) => {
                  locationStore.value!.zipCode = +(
                    event.target as HTMLInputElement
                  ).value;
                }}
                value={locationStore.value?.zipCode}
              ></input>
            </div>
          </div>
          <div>
            <label
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
              for="street"
            >
              Street:
            </label>
            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
              onChange$={(event) => {
                locationStore.value!.street = (
                  event.target as HTMLInputElement
                ).value;
              }}
              value={locationStore.value?.street}
            ></input>
          </div>
          <button
            class="text-white mr-2 bg-indigo-600 hover:bg-indigo-400 focus:ring-4 focus:outline-none focus:ring-indigo-500 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-400 dark:focus:ring-indigo-500"
            preventdefault:click
            onClick$={async () => {
              if (locationStore.value) {
                const price =
                  locationStore.value.price === undefined
                    ? undefined
                    : +locationStore.value.price;
                const zipCode =
                  locationStore.value.zipCode === undefined
                    ? undefined
                    : +locationStore.value.zipCode;
                const result = await client.updateLocation.mutate({
                  addressId: locationStore.value.addressId,
                  address: {
                    city: locationStore.value.city,
                    country: {
                      id: +locationStore.value.countryId,
                    },
                    state: locationStore.value.state,
                    street: locationStore.value.street,
                    zipCode: zipCode,
                    countryId: locationStore.value.countryId,
                  },
                  description: locationStore.value.description,
                  userEmail: locationStore.value.userEmail,
                  link: locationStore.value.link,
                  name: locationStore.value.name,
                  phone: locationStore.value.phone,
                  price: price,
                  type: locationStore.value.type,
                  id: params.locationId,
                });

                if (result.status === Status.SUCCESS) {
                  const toast = document.getElementById("successToast");
                  if (toast) {
                    toast.classList.remove("hidden");
                  }
                } else {
                  const toast = document.getElementById("failedToast");
                  if (toast) {
                    toast.classList.remove("hidden");
                  }
                }
              }
            }}
          >
            Save
          </button>
          <button
            data-modal-target="deleteLocationModal"
            data-modal-toggle="deleteLocationModal"
            class="text-white mr-2 mt-6 bg-indigo-600 hover:bg-indigo-400 focus:ring-4 focus:outline-none focus:ring-indigo-500 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-400 dark:focus:ring-indigo-500"
            type="button"
          >
            Delete
          </button>
        </div>
        <div>
          <iframe
            src={generateGoogleMapsLink(
              true,
              locationStore.value?.city,
              locationStore.value?.state,
              locationStore.value?.zipCode,
              locationStore.value?.street
            )}
            width="600"
            height="450"
            style="border:0;"
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            class="w-[95%] h-[95%] float-right"
          ></iframe>
        </div>
      </div>
      <Modal
        id="deleteLocationModal"
        listType="location"
        size="max-w-xl"
        type="popup"
        listTypeId={params.locationId}
        name="Are you sure you want to delete this location?"
      />
      <Toast
        id="successToast"
        text="Operation Successful!"
        type="success"
        position="top-right"
      ></Toast>
      <Toast
        id="failedToast"
        text="Operation Failed!"
        type="failed"
        position="top-right"
      ></Toast>
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
      userEmail: result.location.userEmail,
      link: result.location.link,
      name: result.location.name,
      phone: result.location.phone,
      price: result.location?.price as unknown as number,
      state: result.location.address.state,
      street: result.location.address.street,
      type: result.location.type,
      zipCode: result.location.address?.zip_code as unknown as number,
    } as LocationStore;
  }
}
