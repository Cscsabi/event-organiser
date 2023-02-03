import { component$, Resource, useResource$, useStore } from "@builder.io/qwik";
import type { LocationInterface } from "~/types";
import { client } from "~/utils/trpc";
import { useNavigate } from "@builder.io/qwik-city";
import { paths } from "~/utils/paths";

export default component$(() => {
  const navigate = useNavigate();
  const resource = useResource$(() => {
    return client.getCountries.query();
  });

  const store = useStore<LocationInterface>({
    email: "adsads@g.c",
    name: "",
    description: "",
    addressId: "TEST",
    city: "",
    countryId: 0,
    street: "",
    state: "",
    zipCode: 0,
    type: "",
    price: 0,
    phone: "",
    link: "",
  });

  return (
    <div>
      <form
        preventdefault:submit
        onSubmit$={() => {
          const status = client.addLocation.mutate({
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

          status.then((result) => {
            if (result.status === "success") {
              navigate.path = paths.location;
            }
          });
        }}
      >
        <label for="locationName">Location name:</label>
        <input
          onInput$={(event) =>
            (store.name = (event.target as HTMLInputElement).value)
          }
          type="text"
          name="locationName"
        ></input>
        <label for="locationType">Location type:</label>
        <input
          onInput$={(event) =>
            (store.type = (event.target as HTMLInputElement).value)
          }
          type="text"
          name="locationType"
        ></input>
        <label for="description">Description:</label>
        <input
          onInput$={(event) =>
            (store.description = (event.target as HTMLInputElement).value)
          }
          type="text"
          name="description"
        ></input>
        <label for="price">Price:</label>
        <input
          onInput$={(event) =>
            (store.price = +(event.target as HTMLInputElement).value)
          }
          type="number"
          name="price"
        ></input>
        <label for="phone">Phone:</label>
        <input
          onInput$={(event) =>
            (store.phone = (event.target as HTMLInputElement).value)
          }
          type="text"
          name="phone"
        ></input>
        <label for="link">Link:</label>
        <input
          onInput$={(event) =>
            (store.link = (event.target as HTMLInputElement).value)
          }
          type="text"
          name="link"
        ></input>
        <label for="address">Address:</label>
        <label for="country">Country:</label>
        <Resource
          value={resource}
          onPending={() => <div>Loading...</div>}
          onResolved={(result) => {
            return (
              <select
                name="country"
                onClick$={(event) =>
                  (store.countryId = +(event.target as HTMLInputElement).value)
                }
              >
                {result.countries.map((country) => {
                  return <option value={country.id}>{country.name}</option>;
                })}
                ;
              </select>
            );
          }}
        />
        <label for="city">City:</label>
        <input
          onInput$={(event) =>
            (store.city = (event.target as HTMLInputElement).value)
          }
          type="text"
          name="city"
        ></input>
        <label for="state">State:</label>
        <input
          onInput$={(event) =>
            (store.state = (event.target as HTMLInputElement).value)
          }
          type="text"
          name="state"
        ></input>
        <label for="street">Street:</label>
        <input
          onInput$={(event) =>
            (store.street = (event.target as HTMLInputElement).value)
          }
          type="text"
          name="street"
        ></input>
        <label for="zipcode">Zip code:</label>
        <input
          onInput$={(event) =>
            (store.zipCode = +(event.target as HTMLInputElement).value)
          }
          type="text"
          name="zipcode"
        ></input>
        <input type="submit"></input>
      </form>
    </div>
  );
});
