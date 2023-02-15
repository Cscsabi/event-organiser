import {
  component$,
  Resource,
  useClientEffect$,
  useResource$,
  useSignal,
  useStyles$,
} from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import type { GetGuestListReturnType } from "~/types";
import { paths } from "~/utils/paths";
import { getUser } from "~/utils/supabase.client";
import { client } from "~/utils/trpc";
import styles from "~/table.css?inline";

export default component$(() => {
  useStyles$(styles);
  const userEmail = useSignal<string>("");
  const navigate = useNavigate();

  useClientEffect$(async ({ track }) => {
    track(() => userEmail.value);
    userEmail.value = (await getUser()).data.user?.email ?? "";
    if (userEmail.value === "") {
      navigate.path = paths.login;
    }
  });

  const resource = useResource$<GetGuestListReturnType>(
    ({ track, cleanup }) => {
      track(() => userEmail.value);
      const controller = new AbortController();
      cleanup(() => controller.abort());
      return client.getGuests.query({
        email: userEmail.value,
      });
    }
  );

  return (
    <div class="table-wrapper">
      <table class="fl-table">
        <thead>
          <tr>
            <th>Firstname</th>
            <th>Lastname</th>
            <th>Email</th>
            <th>Special Needs</th>
            <th>Delete Row</th>
          </tr>
        </thead>

        <Resource
          value={resource}
          onPending={() => <div>Loading...</div>}
          onResolved={(result: GetGuestListReturnType) => {
            return (
              <tbody>
                {result.guests.map((guest) => {
                  return (
                    <tr>
                      <td>{guest.firstname}</td>
                      <td>{guest.lastname}</td>
                      <td>{guest.email}</td>
                      <td>{guest.special_needs}</td>
                      {
                        //TODO
                      }
                      <td>
                        <button>Delete Guest</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            );
          }}
        />
      </table>
    </div>
  );
});
