import {
  component$,
  Resource,
  useContext,
  useResource$,
  useStore,
} from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import type { LocationType } from "@prisma/client";
import { Status } from "event-organiser-api-server/src/status.enum";
import { $translate as t, Speak } from "qwik-speak";
import Toast from "~/components/toast/toast";
import { CTX } from "~/routes/[...lang]/layout";
import { generateRoutingLink } from "~/utils/common.functions";
import { paths } from "~/utils/paths";
import { client } from "~/utils/trpc";
import type { LocationStore } from "~/utils/types";

export default component$(() => {
  const user = useContext(CTX);
  const location = useLocation();
  const navigate = useNavigate();
  const resource = useResource$(() => {
    return client.getCountries.query();
  });

  const store = useStore<LocationStore>({
    name: "",
    description: "",
    addressId: "",
    city: "",
    countryId: 1,
    street: "",
    state: "",
    zipCode: 0,
    type: "INTERIOR",
    price: 0,
    phone: "",
    link: "",
    chooseHere: t("location.chooseHere@@Choose here"),
    loading: t("common.loading@@Loading..."),
  });

  return (
    <Speak assets={["location", "toast", "common"]}>
      <h1 class="mb-6 text-center text-3xl font-semibold text-black dark:text-white">
        {t("location.newLocation@@Create New Location")}
      </h1>
      <form
        preventdefault:submit
        onSubmit$={async () => {
          const result = await client.addLocation.mutate({
            name: store.name,
            description: store.description,
            type: store.type,
            price: store.price,
            phone: store.phone,
            link: store.link,
            userEmail: user.userEmail ?? "",
            addressId: store.addressId,
            address: {
              city: store.city,
              state: store.state,
              street: store.street,
              zipCode: store.zipCode,
              countryId: store.countryId,
              country: {
                id: store.countryId,
              },
            },
          });

          if (result.status === Status.SUCCESS) {
            navigate(
              generateRoutingLink(location.params.lang, paths.locations),
              true
            );
          } else {
            const toast = document.getElementById("failedToast");
            if (toast) {
              toast.classList.remove("hidden");
            }
          }
        }}
      >
        <div class="mb-6">
          <label
            class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
            for="locationName"
          >
            {t("location.locationName@@Location Name:")}
          </label>
          <input
            class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-1/2 p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
            onInput$={(event) =>
              (store.name = (event.target as HTMLInputElement).value)
            }
            type="text"
            name="locationName"
            placeholder={t(
              "location.locationNamePlaceholder@@Example Location"
            )}
            required
            minLength={3}
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
            class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-1/2 p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
            onInput$={(event) =>
              (store.description = (event.target as HTMLInputElement).value)
            }
            type="text"
            name="description"
            placeholder={t(
              "location.descriptionPlaceholder@@Some important information.."
            )}
          ></input>
        </div>
        <div class="grid gap-6 md:grid-cols-2 w-1/2">
          <div>
            <label
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
              for="locationType"
            >
              {t("location.locationType@@Location Type:")}
            </label>
            <select
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
              name="country"
              onChange$={(event) =>
                (store.type = (event.target as unknown as HTMLInputElement)
                  .value as LocationType)
              }
            >
              <option value="" selected disabled hidden>
                {store.chooseHere}
              </option>
              <option value="INTERIOR">
                {t("location.interior@@Interior")}
              </option>
              <option value="EXTERIOR">
                {t("location.exterior@@Exterior")}
              </option>
              <option value="BOTH">
                {t("location.both@@Interior and Exterior")}
              </option>
            </select>
          </div>
          <div>
            <label
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
              for="price"
            >
              {t("location.price@@Price:")}
            </label>
            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
              onInput$={(event) =>
                (store.price = +(event.target as HTMLInputElement).value)
              }
              type="number"
              name="price"
              placeholder="100000"
            ></input>
          </div>
        </div>
        <div class="grid gap-6 mb-6 md:grid-cols-2 w-1/2">
          <div>
            <label
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
              for="phone"
            >
              {t("common.phone@@Phone:")}
            </label>
            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
              onInput$={(event) =>
                (store.phone = (event.target as HTMLInputElement).value)
              }
              type="text"
              name="phone"
              placeholder={t("common.phonePlaceholder@@123-456-7890")}
            ></input>
          </div>
          <div>
            <label
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
              for="link"
            >
              {t("location.link@@Link:")}
            </label>
            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
              onInput$={(event) =>
                (store.link = (event.target as HTMLInputElement).value)
              }
              type="text"
              name="link"
              placeholder={t("location.linkPlaceholder@@www.example.com")}
            ></input>
          </div>
        </div>
        <div>
          <label
            class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
            for="country"
          >
            {t("location.country@@Country:")}
          </label>
          <Resource
            value={resource}
            onPending={() => <div>{store.loading}</div>}
            onResolved={(result) => {
              return (
                <div>
                  <select
                    class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-1/2 p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
                    name="country"
                    onChange$={(event) =>
                      (store.countryId = +(
                        event.target as unknown as HTMLInputElement
                      ).value)
                    }
                  >
                    <option value="" selected disabled hidden>
                      {store.chooseHere}
                    </option>
                    {result.countries.map((country) => {
                      return <option value={country.id}>{country.name}</option>;
                    })}
                    ;
                  </select>
                </div>
              );
            }}
          />
        </div>
        <div class="grid gap-6 md:grid-cols-2 w-1/2">
          <div>
            <label
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
              for="city"
            >
              {t("location.city@@City:")}
            </label>
            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
              onInput$={(event) =>
                (store.city = (event.target as HTMLInputElement).value)
              }
              type="text"
              name="city"
              placeholder={t("location.cityPlaceholder@@Los Angeles")}
            ></input>
          </div>
          <div>
            <label
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
              for="state"
            >
              {t("location.state@@State:")}
            </label>
            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
              onInput$={(event) =>
                (store.state = (event.target as HTMLInputElement).value)
              }
              type="text"
              name="state"
              placeholder={t("location.statePlaceholder@@California")}
            ></input>
          </div>
        </div>
        <div class="grid gap-6 mb-6 md:grid-cols-2 w-1/2">
          <div>
            <label
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
              for="street"
            >
              {t("location.street@@Street, house no.:")}
            </label>
            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
              onInput$={(event) =>
                (store.street = (event.target as HTMLInputElement).value)
              }
              type="text"
              name="street"
              placeholder={t(
                "location.streetPlaceholder@@Hollywood Boulevard, Vine St"
              )}
            ></input>
          </div>
          <div>
            <label
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
              for="zipcode"
            >
              {t("location.zipCode@@Zip Code:")}
            </label>
            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
              onInput$={(event) =>
                (store.zipCode = +(event.target as HTMLInputElement).value)
              }
              type="number"
              name="zipcode"
              placeholder={t("location.zipCodePlaceholder@@90028")}
            ></input>
          </div>
        </div>
        <button
          class="mt-6 mr-2 text-white dark:text-black bg-green-800 hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-600 font-medium rounded-lg text-md w-1/2 sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-300 dark:hover:bg-indigo-600 dark:focus:ring-indigo-600"
          type="submit"
        >
          {t("location.createLocation@@Create Location")}
        </button>
      </form>
      <Toast
        id="failedToast"
        text={t("toast.operationFailed@@Operation Failed!")}
        type="failed"
        position="top-right"
      ></Toast>
    </Speak>
  );
});
