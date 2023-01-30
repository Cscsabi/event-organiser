import { component$, useStore } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { registerUser } from "~/utils/supabase.client";
import type { SignUpWithPasswordCredentials } from "@supabase/supabase-js";
import { paths } from "~/utils/paths";
import { client } from "~/utils/trpc";
import type { CreateUserInput } from "event-organiser-api-server/src/user.schema";

export default component$(() => {
  const navigate = useNavigate();
  const store = useStore({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    message: "",
  });

  return (
    <>
      <form
        preventdefault:submit
        onSubmit$={() => {
          handleRegister(
            store.email,
            store.password,
            store.firstname,
            store.lastname
          ).then((result) => {
            if (result) {
              navigate.path = paths.index;
            }
          });
        }}
      >
        <label for="firstname">First name:</label>
        <input
          onInput$={(event) =>
            (store.firstname = (event.target as HTMLInputElement).value)
          }
          type="text"
          name="firstname"
          value={store.firstname}
        ></input>
        <label for="lastname">Last name:</label>
        <input
          onInput$={(event) =>
            (store.lastname = (event.target as HTMLInputElement).value)
          }
          type="text"
          name="lastname"
          value={store.lastname}
        ></input>
        <label for="email">Email:</label>
        <input
          onInput$={(event) =>
            (store.email = (event.target as HTMLInputElement).value)
          }
          type="text"
          name="email"
          value={store.email}
        ></input>
        <label for="password">Password:</label>
        <input
          onInput$={(event) =>
            (store.password = (event.target as HTMLInputElement).value)
          }
          type="password"
          name="password"
          value={store.password}
        ></input>
        <input type="submit" value="Sign up"></input>
      </form>
    </>
  );
});

export async function handleRegister(
  email: string,
  password: string,
  firstname: string,
  lastname: string
) {
  // TODO: Check the values, send feedback according to the input
  const result = await client.getUser.query({ email: email });
  console.log(result.status);
  if (result.status === "success") {
    return false;
  }
  const credentials: SignUpWithPasswordCredentials = {
    email: email,
    password: password,
  };

  const customStatus = await registerUser(credentials);
  console.log(customStatus);
  if (customStatus.result === "success") {
    const detailedCredentials: CreateUserInput = {
      email: email.toLowerCase(),
      firstname: capitalize(firstname),
      lastname: capitalize(lastname),
    };

    const finalResult = await client.createUser.mutate(detailedCredentials);
    if (finalResult.status) {
      return true;
    }
  }
  return false;
}

function capitalize(input: string) {
  return input.charAt(0).toUpperCase() + input.toLowerCase().slice(1);
}
