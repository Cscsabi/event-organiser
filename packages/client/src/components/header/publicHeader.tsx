import { component$, useStyles$ } from "@builder.io/qwik";
import { QwikLogo } from "~/components/icons/qwik";
import { paths } from "~/utils/paths";
import styles from "./header.css?inline";

export const PublicHeader = component$(() => {
  useStyles$(styles);
  return (
    <header class="topnav">
      <div>
        <a href={paths.index}>
          <QwikLogo />
        </a>
      </div>
      <div class="topnav-right">
        <a href={paths.login}>
          <i class="fa-solid fa-right-to-bracket"></i> Login
        </a>
        <a href={paths.register}>
          <i class="fa-solid fa-user-plus"></i> Register
        </a>
      </div>
    </header>
  );
});
