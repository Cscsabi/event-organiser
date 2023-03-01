import { component$, useContext, useStyles$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { QwikLogo } from "~/components/icons/qwik";
import { paths } from "~/utils/paths";
import { logoutUser } from "~/utils/supabase.client";
import { CTX } from "~/routes/layout";
import styles from "./header.css?inline";
import { Status } from "event-organiser-api-server/src/status.enum";

export const ProtectedHeader = component$(() => {
  useStyles$(styles);
  const user = useContext(CTX);
  const navigate = useNavigate();
  return (
    <header class="topnav">
      <div>
        <a href={paths.index}>
          <QwikLogo />
        </a>
      </div>
      <div class="topnav-right">
        <a href={paths.previousEvents}>
          <i class="fa-regular fa-calendar-xmark"></i> Previous Events
        </a>
        <a href={paths.events}>
          <i class="fa-solid fa-calendar-days"></i> Active Events
        </a>
        <a href={paths.guests}>
          <i class="fa-solid fa-person"></i> Guests
        </a>
        <a href={paths.locations}>
          <i class="fa-solid fa-location-pin"></i> Locations
        </a>
        <a href={paths.contacts}>
          <i class="fa-solid fa-address-card"></i> Contacts
        </a>
        <a href={paths.profile}>
          <i class="fa-regular fa-user"></i> Profile
        </a>
        <a
          onClick$={async () => {
            console.log("Clicked!");
            const logout = await logoutUser();
            if (logout.result === Status.SUCCESS) {
              navigate(paths.logout);
              user.value = "";
            }
          }}
        >
          <i class="fa-solid fa-right-from-bracket"></i> Logout
        </a>
      </div>
    </header>
  );
});
