import { component$, useStyles$ } from "@builder.io/qwik";
import { QwikLogo } from "~/components/icons/qwik";
import { Link } from "@builder.io/qwik-city";
import { paths } from "~/utils/paths";
import styles from "./header.css?inline";

export const PublicHeader = component$(() => {
  useStyles$(styles);
  return (
    <header class="topnav">
      <div>
        <Link href={paths.index}>
          <QwikLogo />
        </Link>
      </div>
      <div class="topnav-right">
        <Link href={paths.login}>
          <i class="fa-solid fa-right-to-bracket"></i> Login
        </Link>
        <Link href={paths.register}>
          <i class="fa-solid fa-user-plus"></i> Register
        </Link>
      </div>
    </header>
  );
});
