import {
  component$,
  useClientEffect$,
  useStore,
  useStyles$,
} from "@builder.io/qwik";
import { client } from "~/utils/trpc";
import { getUser } from "~/utils/supabase.client";
import { useNavigate } from "@builder.io/qwik-city";
import { paths } from "~/utils/paths";
import styles from "~/routes/index.scss?inline";
import { Status } from "event-organiser-api-server/src/status.enum";
import type { NewContact } from "~/utils/types";

export default component$(() => {
  useStyles$(styles);
  const store = useStore<NewContact>({
    cost: 0,
    description: "",
    email: "",
    name: "",
    phone: "",
    userEmail: "",
  });
  const navigate = useNavigate();

  useClientEffect$(async () => {
    const userDetails = await getUser();
    if (!userDetails.data.user) {
      navigate.path = paths.login;
    } else {
      store.userEmail = userDetails.data.user.email ?? "";
    }
  });

  return (
    <div class="form_wrapper">
      <div class="form_container">
        <div class="title_container">
          <h2>Add Contact</h2>
        </div>
        <div class="row clearfix">
          <div class="">
            <form
              preventdefault:submit
              onSubmit$={async () => {
                console.log(store.userEmail);
                const result = await client.addContact.mutate({
                  cost: store.cost,
                  description: store.description,
                  email: store.email,
                  name: store.name,
                  phone: store.phone,
                  userEmail: store.userEmail,
                });

                if (result.status === Status.SUCCESS) {
                  navigate.path = paths.contacts;
                }
              }}
            >
              <label for="contactName">Contact name:</label>
              <div class="input_field">
                <input
                  onInput$={(event) =>
                    (store.name = (event.target as HTMLInputElement).value)
                  }
                  type="text"
                  name="contactName"
                ></input>
              </div>
              <label for="cost">Cost:</label>
              <div class="input_field">
                <input
                  onChange$={(event) => {
                    store.cost = +(event.target as HTMLInputElement).value;
                  }}
                  type="number"
                  name="cost"
                ></input>
              </div>
              <label for="phone">Phone:</label>
              <div class="input_field">
                <input
                  onChange$={(event) => {
                    store.phone = (event.target as HTMLInputElement).value;
                  }}
                  type="text"
                  name="phone"
                ></input>
              </div>
              <label for="email">Email:</label>
              <div class="input_field">
                <input
                  onChange$={(event) => {
                    store.email = (event.target as HTMLInputElement).value;
                  }}
                  type="text"
                  name="email"
                ></input>
              </div>
              <label for="description">Description:</label>
              <div class="input_field">
                <input
                  onChange$={(event) => {
                    store.description = (
                      event.target as HTMLInputElement
                    ).value;
                  }}
                  type="text"
                  name="description"
                ></input>
              </div>
              <input type="submit" value="Add Contact"></input>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
});
