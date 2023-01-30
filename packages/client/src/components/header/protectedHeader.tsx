import { component$, useContext } from "@builder.io/qwik";
import { Link, useNavigate } from "@builder.io/qwik-city";
import { QwikLogo } from "~/components/icons/qwik";
import { paths } from "~/utils/paths";
import { logoutUser } from "~/utils/supabase.client";
import { CTX } from "~/routes/layout";

export const ProtectedHeader = component$(() => {
  const user = useContext(CTX);
  const navigate = useNavigate();
  return (
    <header>
      <div>
        <Link href={paths.index}>
          <QwikLogo />
        </Link>
      </div>
      <ul>
        <li>
          <Link href={paths.profile}>My Profile</Link>
        </li>
        <li>
          <button
            onClick$={() => {
              logoutUser().then((logout) => {
                if (logout.result === "success") {
                  navigate.path = paths.logout;
                  user.value = "";
                }
              });
            }}
          >
            Logout
          </button>
        </li>
        <li>
          <Link href={paths.events}>All Events</Link>
        </li>
      </ul>
    </header>
  );
});