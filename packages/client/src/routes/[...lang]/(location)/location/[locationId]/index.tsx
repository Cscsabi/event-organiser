import {
  component$,
  useContext,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { StaticGenerateHandler, DocumentHead } from "@builder.io/qwik-city";
import { useLocation } from "@builder.io/qwik-city";
import { Status } from "event-organiser-api-server/src/status.enum";
import { $translate as t, Speak } from "qwik-speak";
import Modal from "~/components/modal/modal";
import Toast from "~/components/toast/toast";
import { CTX } from "~/routes/[...lang]/layout";
import { generateGoogleMapsLink } from "~/utils/common.functions";
import { client } from "~/utils/trpc";
import type { LocationStore } from "~/utils/types";
import type { LocationType } from "@prisma/client";

export default component$(() => {
  const user = useContext(CTX);
  const { params } = useLocation();
  const store = useStore<LocationStore>({
    addressId: "",
    city: "",
    countryId: 0,
    name: "",
    street: "",
    type: "INTERIOR",
    chooseHere: "",
    description: "",
    link: "",
    loading: "",
    phone: "",
    price: 0,
    state: "",
    zipCode: 0,
  });

  store.chooseHere = t("location.chooseHere@@Choose here");
  store.loading = t("location.loading@@Loading...");

  useVisibleTask$(async () => {
    const location = await getCurrentLocation(params.locationId);
    if (location) {
      store.addressId = location.addressId;
      store.city = location.city;
      store.countryId = location.countryId;
      store.name = location.name;
      store.street = location.street;
      store.type = location.type;
      store.description = location.description;
      store.link = location.link;
      store.phone = location.phone;
      store.price = location.price;
      store.state = location.state;
      store.zipCode = location.zipCode;
    }
  });

  return (
    <Speak assets={["location", "toast", "common"]}>
      <h1 class="mb-6 text-center text-3xl font-semibold text-black dark:text-white">
        {t("location.location@@Location")}
      </h1>
      <div class="grid gap-4 mb-6 mt-8 md:grid-cols-2 w-full">
        <div>
          <div>
            <label
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
              for="name"
            >
              {t("location.name@@Name:")}
            </label>
            <input
              class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              onChange$={(event) => {
                store.name = (event.target as HTMLInputElement).value;
              }}
              value={store.name}
            ></input>
          </div>
          <div>
            <label
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
              for="description"
            >
              {t("common.description@@Description:")}
            </label>
            <input
              class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              onChange$={(event) => {
                store.description = (event.target as HTMLInputElement).value;
              }}
              value={store.description}
            ></input>
          </div>
          <div class="grid gap-6 md:grid-cols-2 w-full">
            <div>
              <label
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="type"
              >
                {t("location.type@@Type:")}
              </label>
              <select
                class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-slate-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
                name="country"
                onChange$={(event) =>
                  (store.type = (event.target as unknown as HTMLInputElement)
                    .value as LocationType)
                }
              >
                <option value="" selected disabled hidden>
                  {store.type === "INTERIOR"
                    ? t("location.interior@@Interior")
                    : store.type === "EXTERIOR"
                    ? t("location.exterior@@Exterior")
                    : store.type === "BOTH"
                    ? t("location.both@@Interior and Exterior")
                    : store.chooseHere}
                </option>
                <option value="INTERIOR">
                  {t("location.interior@@Interior")}
                </option>
                <option value="EXTERIOR">
                  {t("location.exterior@@Exterior")}
                </option>
                <option value="BOTH">{t("location.both@@Both")}</option>
              </select>
            </div>
            <div>
              <label
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="link"
              >
                {t("location.link@@Link:")}
              </label>
              <input
                class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                onChange$={(event) => {
                  store.link = (event.target as HTMLInputElement).value;
                }}
                value={store.link}
              ></input>
            </div>
          </div>
          <div class="grid gap-6 mb-6 md:grid-cols-2 w-full">
            <div>
              <label
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="phone"
              >
                {t("common.phone@@Phone:")}
              </label>
              <input
                class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                onChange$={(event) => {
                  store.phone = (event.target as HTMLInputElement).value;
                }}
                value={store.phone}
              ></input>
            </div>
            <div>
              <label
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="price"
              >
                {t("location.price@@Price:")}
              </label>
              <input
                type="number"
                class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                onChange$={(event) => {
                  store.price = +(event.target as HTMLInputElement).value;
                }}
                value={store.price}
              ></input>
            </div>
          </div>
          <div>
            <label
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
              for="state"
            >
              {t("location.state@@State:")}
            </label>
            <input
              class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              onChange$={(event) => {
                store.state = (event.target as HTMLInputElement).value;
              }}
              value={store.state}
            ></input>
          </div>
          <div class="grid gap-6 mb-6 md:grid-cols-2 w-full">
            <div>
              <label
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="city"
              >
                {t("location.city@@City:")}
              </label>
              <input
                class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                onChange$={(event) => {
                  store.city = (event.target as HTMLInputElement).value;
                }}
                value={store.city}
              ></input>
            </div>
            <div>
              <label
                class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
                for="zipCode"
              >
                {t("location.zipCode@@Zip Code:")}
              </label>
              <input
                type="number"
                class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                onChange$={(event) => {
                  store.zipCode = +(event.target as HTMLInputElement).value;
                }}
                value={store.zipCode}
              ></input>
            </div>
          </div>
          <div>
            <label
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
              for="street"
            >
              {t("location.street@@Street:")}
            </label>
            <input
              class="bg-gray-300 border border-slate-400 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              onChange$={(event) => {
                store.street = (event.target as HTMLInputElement).value;
              }}
              value={store.street}
            ></input>
          </div>
          <button
            class="mt-6 mr-2 text-white bg-sky-600 hover:bg-sky-700 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-700 dark:hover:bg-blue-600"
            preventdefault:click
            onClick$={async () => {
              if (store) {
                const price =
                  store.price === undefined ? undefined : +store.price;
                const zipCode =
                  store.zipCode === undefined ? undefined : +store.zipCode;
                const result = await client.updateLocation.mutate({
                  addressId: store.addressId,
                  address: {
                    city: store.city,
                    country: {
                      id: +store.countryId,
                    },
                    state: store.state,
                    street: store.street,
                    zipCode: zipCode,
                    countryId: store.countryId,
                  },
                  description: store.description,
                  userEmail: user.userEmail,
                  link: store.link,
                  name: store.name,
                  phone: store.phone,
                  price: price,
                  type: store.type,
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
            {t("common.save@@Save")}
          </button>
          <button
            data-modal-target="deleteLocationModal"
            data-modal-toggle="deleteLocationModal"
            class="mt-6 mr-2 text-white bg-sky-600 hover:bg-sky-700 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-700 dark:hover:bg-blue-600"
            type="button"
          >
            {t("common.delete@@Delete")}
          </button>
        </div>
        <div>
          <iframe
            src={generateGoogleMapsLink(
              true,
              store.city,
              store.state,
              store.zipCode,
              store.street
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
        name={t(
          "location.deleteLocation@@Are you sure you want to delete this location?"
        )}
      />
      <Toast
        id="successToast"
        text={t("toast.operationSuccessful@@Operation Successful!")}
        type="success"
        position="top-right"
      ></Toast>
      <Toast
        id="failedToast"
        text={t("toast.operationFailed@@Operation Failed!")}
        type="failed"
        position="top-right"
      ></Toast>
    </Speak>
  );
});

export const onStaticGenerate: StaticGenerateHandler = async () => {
  const user = useContext(CTX);

  const result = await client.getLocations.query({
    email: user.userEmail ?? "",
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

export const head: DocumentHead = {
  title: 'Location',
};