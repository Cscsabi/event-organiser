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
          console.log(store);
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
            navigate(paths.location + result.location.id);
          }
        }}
      >
        <div class="mb-6">
          <label
            class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
            for="locationName"
          >
            Location name:
          </label>
          <input
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onInput$={(event) =>
              (store.name = (event.target as HTMLInputElement).value)
            }
            type="text"
            name="locationName"
            required
            minLength={3}
          ></input>
        </div>
        <div>
          <label
            class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
            for="description"
          >
            Description:
          </label>
          <input
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onInput$={(event) =>
              (store.description = (event.target as HTMLInputElement).value)
            }
            type="text"
            name="description"
          ></input>
        </div>
        <div class="grid gap-6 mb-6 md:grid-cols-2 w-1/2">
          <div>
            <label
              class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
              for="locationType"
            >
              Location type:
            </label>
            <input
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onInput$={(event) =>
                (store.type = (event.target as HTMLInputElement).value)
              }
              type="text"
              name="locationType"
            ></input>
          </div>
          <div>
            <label
              class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
              for="price"
            >
              Price:
            </label>
            <input
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onInput$={(event) =>
                (store.price = +(event.target as HTMLInputElement).value)
              }
              type="number"
              name="price"
            ></input>
          </div>
        </div>
        <div class="grid gap-6 mb-6 md:grid-cols-2 w-1/2">
          <div>
            <label
              class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
              for="phone"
            >
              Phone:
            </label>
            <input
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onInput$={(event) =>
                (store.phone = (event.target as HTMLInputElement).value)
              }
              type="text"
              name="phone"
            ></input>
          </div>
          <div>
            <label
              class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
              for="link"
            >
              Link:
            </label>
            <input
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onInput$={(event) =>
                (store.link = (event.target as HTMLInputElement).value)
              }
              type="text"
              name="link"
            ></input>
          </div>
        </div>
        <div>
          <label
            class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
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
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
              class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
              for="city"
            >
              City:
            </label>
            <input
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onInput$={(event) =>
                (store.city = (event.target as HTMLInputElement).value)
              }
              type="text"
              name="city"
            ></input>
          </div>
          <div>
            <label
              class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
              for="state"
            >
              State:
            </label>
            <input
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onInput$={(event) =>
                (store.state = (event.target as HTMLInputElement).value)
              }
              type="text"
              name="state"
            ></input>
          </div>
        </div>
        <div class="grid gap-6 mb-6 md:grid-cols-2 w-1/2">
          <div>
            <label
              class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
              for="street"
            >
              Street, house no.:
            </label>
            <input
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onInput$={(event) =>
                (store.street = (event.target as HTMLInputElement).value)
              }
              type="text"
              name="street"
            ></input>
          </div>
          <div>
            <label
              class="block mb-2 mt-6 text-sm font-medium text-gray-900 dark:text-white"
              for="zipcode"
            >
              Zip code:
            </label>
            <input
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onInput$={(event) =>
                (store.zipCode = +(event.target as HTMLInputElement).value)
              }
              type="number"
              name="zipcode"
            ></input>
          </div>
        </div>
        <button
          class="w-1/2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          type="submit"
        >
          Create Location
        </button>
      </form>
    </div>
  );
});
