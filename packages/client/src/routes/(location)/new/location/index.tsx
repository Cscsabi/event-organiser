import {
  component$,
  Resource,
  useClientEffect$,
  useResource$,
  useStore,
  useStyles$,
} from "@builder.io/qwik";
import type { LocationInterface } from "~/types";
import { client } from "~/utils/trpc";
import { useNavigate } from "@builder.io/qwik-city";
import { paths } from "~/utils/paths";
import { getUser } from "~/utils/supabase.client";
import styles from "~/routes/index.scss?inline";

export default component$(() => {
  useStyles$(styles);
  const navigate = useNavigate();
  const resource = useResource$(() => {
    return client.getCountries.query();
  });

  const store = useStore<LocationInterface>({
    email: "",
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

  useClientEffect$(async () => {
    const userResponse = await getUser();
    if (!userResponse.data.user) {
      navigate.path = paths.login;
    }
    store.email = userResponse.data.user?.email || "";
  });

  return (
    <div class="form_wrapper">
      <div class="form_container">
        <div class="title_container">
          <h2>Create New Location</h2>
        </div>
        <div class="row clearfix">
          <div class="">
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
                  userEmail: store.email,
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

                if (result.status === "success") {
                  navigate.path = paths.location + result.location.id;
                }
              }}
            >
              <label for="locationName">Location name:</label>
              <div class="input_field">
                <input
                  onInput$={(event) =>
                    (store.name = (event.target as HTMLInputElement).value)
                  }
                  type="text"
                  name="locationName"
                ></input>
              </div>
              <label for="locationType">Location type:</label>
              <div class="input_field">
                <input
                  onInput$={(event) =>
                    (store.type = (event.target as HTMLInputElement).value)
                  }
                  type="text"
                  name="locationType"
                ></input>
              </div>
              <label for="description">Description:</label>
              <div class="input_field">
                <input
                  onInput$={(event) =>
                    (store.description = (
                      event.target as HTMLInputElement
                    ).value)
                  }
                  type="text"
                  name="description"
                ></input>
              </div>
              <label for="price">Price:</label>
              <div class="input_field">
                <input
                  onInput$={(event) =>
                    (store.price = +(event.target as HTMLInputElement).value)
                  }
                  type="number"
                  name="price"
                ></input>
              </div>
              <label for="phone">Phone:</label>
              <div class="input_field">
                <input
                  onInput$={(event) =>
                    (store.phone = (event.target as HTMLInputElement).value)
                  }
                  type="text"
                  name="phone"
                ></input>
              </div>
              <label for="link">Link:</label>
              <div class="input_field">
                <input
                  onInput$={(event) =>
                    (store.link = (event.target as HTMLInputElement).value)
                  }
                  type="text"
                  name="link"
                ></input>
              </div>
              <label for="address">Address:</label>
              <label for="country">Country:</label>
              <Resource
                value={resource}
                onPending={() => <div>Loading...</div>}
                onResolved={(result) => {
                  return (
                    <div class="input_field">
                      <select
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
                          return (
                            <option value={country.id}>{country.name}</option>
                          );
                        })}
                        ;
                      </select>
                    </div>
                  );
                }}
              />
              <label for="city">City:</label>
              <div class="input_field">
                <input
                  onInput$={(event) =>
                    (store.city = (event.target as HTMLInputElement).value)
                  }
                  type="text"
                  name="city"
                ></input>
              </div>
              <label for="state">State:</label>
              <div class="input_field">
                <input
                  onInput$={(event) =>
                    (store.state = (event.target as HTMLInputElement).value)
                  }
                  type="text"
                  name="state"
                ></input>
              </div>
              <label for="street">Street, house no.:</label>
              <div class="input_field">
                <input
                  onInput$={(event) =>
                    (store.street = (event.target as HTMLInputElement).value)
                  }
                  type="text"
                  name="street"
                ></input>
              </div>
              <label for="zipcode">Zip code:</label>
              <div class="input_field">
                <input
                  onInput$={(event) =>
                    (store.zipCode = +(event.target as HTMLInputElement).value)
                  }
                  type="number"
                  name="zipcode"
                ></input>
                <input type="submit" value="Create Location"></input>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
});
