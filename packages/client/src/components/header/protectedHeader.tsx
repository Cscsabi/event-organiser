import { component$, useContext, useStyles$ } from "@builder.io/qwik";
import { Link, useNavigate } from "@builder.io/qwik-city";
import { QwikLogo } from "~/components/icons/qwik";
import { paths } from "~/utils/paths";
import { logoutUser } from "~/utils/supabase.client";
import { CTX } from "~/routes/layout";
import styles from "./header.css?inline";

export const ProtectedHeader = component$(() => {
  useStyles$(styles);
  const user = useContext(CTX);
  const navigate = useNavigate();
  return (
    <header class="topnav">
      <div>
        <Link href={paths.index}>
          <QwikLogo />
        </Link>
      </div>
      <div class="topnav-right">
        <Link href={paths.previousEvents}>
        <i class="fa-regular fa-calendar-xmark"></i> Previous Events
        </Link>
        <Link href={paths.events}>
          <i class="fa-solid fa-calendar-days"></i> Active Events
        </Link>
        <Link href={paths.guests}>
        <i class="fa-solid fa-person"></i> Guests
        </Link>
        <Link href={paths.locations}>
          <i class="fa-solid fa-location-pin"></i> My Locations
        </Link>
        <Link href={paths.profile}>
          <i class="fa-regular fa-user"></i> Profile
        </Link>
        <a
          onClick$={async () => {
            console.log("Clicked!");
            const logout = await logoutUser();
            if (logout.result === "success") {
              navigate.path = paths.logout;
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
