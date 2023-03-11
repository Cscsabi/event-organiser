import {
  component$,
  Resource,
  useBrowserVisibleTask$,
  useResource$,
  useStore,
} from "@builder.io/qwik";
import type { LocationStore } from "~/utils/types";
import { client } from "~/utils/trpc";
import { useNavigate } from "@builder.io/qwik-city";
import { paths } from "~/utils/paths";
import { getUser } from "~/utils/supabase.client";
import { Status } from "event-organiser-api-server/src/status.enum";
import Toast from "~/components/toast/toast";

export default component$(() => {
  const navigate = useNavigate();
  const resource = useResource$(() => {
    return client.getCountries.query();
  });

  const store = useStore<LocationStore>({
    userEmail: "",
    name: "",
    description: "",
    addressId: "",
    city: "",
    countryId: 1,
    street: "",
    state: "",
    zipCode: 0,
    type: "",
    price: 0,
    phone: "",
    link: "",
  });

  useBrowserVisibleTask$(async () => {
    const userResponse = await getUser();
    if (!userResponse.data.user) {
      navigate(paths.login);
    }
    store.userEmail = userResponse.data.user?.email ?? "";
  });

  return (
    <div>
      <h1 class="mb-6 text-3xl font-semibold text-black dark:text-white">
        Create New Location
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
            userEmail: store.userEmail,
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
            navigate(paths.locations);
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
            Location name:
          </label>
          <input
            class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-1/2 p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
            onInput$={(event) =>
              (store.name = (event.target as HTMLInputElement).value)
            }
            type="text"
            name="locationName"
            placeholder="Example Location"
            required
            minLength={3}
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
            class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-1/2 p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
            onInput$={(event) =>
              (store.description = (event.target as HTMLInputElement).value)
            }
            type="text"
            name="description"
            placeholder="Some important information.."
          ></input>
        </div>
        <div class="grid gap-6 mb-6 md:grid-cols-2 w-1/2">
          <div>
            <label
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
              for="locationType"
            >
              Location type:
            </label>
            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
              onInput$={(event) =>
                (store.type = (event.target as HTMLInputElement).value)
              }
              type="text"
              name="locationType"
              placeholder="Type of Location"
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
              Phone:
            </label>
            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
              onInput$={(event) =>
                (store.phone = (event.target as HTMLInputElement).value)
              }
              type="text"
              name="phone"
              placeholder="123-456-7890"
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
              onInput$={(event) =>
                (store.link = (event.target as HTMLInputElement).value)
              }
              type="text"
              name="link"
              placeholder="www.example.com"
            ></input>
          </div>
        </div>
        <div>
          <label
            class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
            for="country"
          >
            Country:
          </label>
          <Resource
            value={resource}
            onPending={() => <div>Loading...</div>}
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
                      Choose here
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
        <div class="grid gap-6 mb-6 md:grid-cols-2 w-1/2">
          <div>
            <label
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
              for="city"
            >
              City:
            </label>
            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
              onInput$={(event) =>
                (store.city = (event.target as HTMLInputElement).value)
              }
              type="text"
              name="city"
              placeholder="Budapest"
            ></input>
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
              onInput$={(event) =>
                (store.state = (event.target as HTMLInputElement).value)
              }
              type="text"
              name="state"
              placeholder="Pest"
            ></input>
          </div>
        </div>
        <div class="grid gap-6 mb-6 md:grid-cols-2 w-1/2">
          <div>
            <label
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
              for="street"
            >
              Street, house no.:
            </label>
            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
              onInput$={(event) =>
                (store.street = (event.target as HTMLInputElement).value)
              }
              type="text"
              name="street"
              placeholder="Örs vezér tere 25/A"
            ></input>
          </div>
          <div>
            <label
              class="block mb-2 mt-6 text-lg font-medium text-gray-900 dark:text-white"
              for="zipcode"
            >
              Zip code:
            </label>
            <input
              class="bg-gray-300 border border-green-500 text-gray-900 text-md rounded-lg focus:ring-green-600 focus:border-green-600 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-600 dark:focus:border-indigo-600"
              onInput$={(event) =>
                (store.zipCode = +(event.target as HTMLInputElement).value)
              }
              type="number"
              name="zipcode"
              placeholder="1106"
            ></input>
          </div>
        </div>
        <button
          class="text-white mr-2 bg-indigo-600 hover:bg-indigo-400 focus:ring-4 focus:outline-none focus:ring-indigo-500 font-medium rounded-lg text-md w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-400 dark:focus:ring-indigo-500"
          type="submit"
        >
          Create Location
        </button>
      </form>
      <Toast
        id="failedToast"
        text="Operation Failed!"
        type="failed"
        position="top-right"
      ></Toast>
    </div>
  );
});
